/**
 * Builds the My Events passbook view-model from the real
 * /events/registrations/mine list.
 *
 * That endpoint only populates a partial event (title/eventDate/venue/
 * community — see registrations.controller.js's listMyRegistrations
 * select), not the full document the passbook cards want to show
 * (category, banner image, price, capacity, tags, team format). So this
 * fetches the full Event per unique registered event via getEvent — cheap
 * for the handful of events a student is actually registered for — and
 * merges it in. Team members are fetched the same way, only for
 * registrations that actually have a teamName (solo registrations have
 * none).
 */
import { getEvent, listMyRegistrations, listTeamMembers } from '@/features/events/events.api';
import { mapEvent } from '@/features/events/eventsMapper';
import { splitDateFormatted } from '@/features/events/eventsDateUtils';

export async function buildRegisteredEvents() {
  const { registrations } = await listMyRegistrations({ limit: 100 });
  const active = registrations.filter((r) => r.status !== 'cancelled' && r.event);

  const uniqueEventIds = [...new Set(active.map((r) => String(r.event._id)))];
  const eventById = new Map();
  await Promise.all(
    uniqueEventIds.map(async (id) => {
      try {
        const { event } = await getEvent(id);
        eventById.set(id, mapEvent(event));
      } catch {
        // Event hard-deleted or otherwise unreachable — that registration
        // is dropped below rather than rendered with missing data.
      }
    })
  );

  const teamRegs = active.filter((r) => r.teamName);
  const teamMembersByRegId = new Map();
  await Promise.all(
    teamRegs.map(async (r) => {
      try {
        const { members } = await listTeamMembers(r._id);
        teamMembersByRegId.set(
          r._id,
          members
            .filter((m) => m.student)
            .map((m) => ({ id: m._id, studentId: m.student._id, name: m.student.name, status: m.status }))
        );
      } catch {
        teamMembersByRegId.set(r._id, []);
      }
    })
  );

  return active
    .map((r) => {
      const src = eventById.get(String(r.event._id));
      if (!src) return null;
      const { dateOnly, timeOnly } = splitDateFormatted(src.dateFormatted);

      return {
        id: src.id,
        registrationId: r._id,
        registrationStatus: r.status, // 'confirmed' | 'waitlisted'
        leaderId: String(r.student),
        title: src.title,
        category: src.category,
        tags: src.tags,
        hostName: src.hostName,
        hostIcon: src.hostIcon,
        hostColor: src.hostColor,
        isVerified: src.isVerified,
        dateFormatted: dateOnly,
        rawDate: src.date.toISOString(),
        startTime: timeOnly,
        venue: src.venue,
        isVirtual: false,
        teamSize: src.teamFormat,
        teamSizeLimits: src.teamSize,
        registrationType: src.registrationType,
        formQuestions: src.formQuestions,
        teamName: r.teamName || '',
        teamMembers: teamMembersByRegId.get(r._id) || [],
        payment: src.payment === 'Free' ? 'FREE' : 'PAID',
        price_amount: src.price_amount,
        paymentStatus: r.paymentStatus || (src.price_amount > 0 ? 'pending' : 'not_required'),
        paymentProof: r.paymentProof || null,
        paymentRejectionReason: r.paymentRejectionReason || '',
        slotExpiresAt: r.slotExpiresAt || null,
        transactionId: r.transactionId || '',
        paymentNotes: r.paymentNotes || '',
        paymentInstructions: src.paymentInstructions || '',
        upiId: src.upiId || '',
        paymentQrCode: src.paymentQrCode || null,
        ticketId: r.qrToken,
        registeredOn: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        imageUrl: src.imageUrl,
        capacity: src.capacity,
        registered: src.registered_count,
      };
    })
    .filter(Boolean);
}
