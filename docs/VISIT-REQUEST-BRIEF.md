# Expert visit request
Surface: /case/new. Mode: Operate. Requested 2026-10-20.

The user requested implementation with the approved minimal red-and-black photographic language and delegated routine choices to professional research. Extend the existing intake; do not introduce another case API.

Research:
- RAC Mobile Mechanic: car/problem details, date and location, confirmation and arrival follow-up. https://www.rac.co.uk/car-care/mobile-mechanic
- AA Car Care: home/work diagnostics subject to suitable location and availability. https://www.theaa.com/car-care/
- GOV.UK: editable check-answers step before final submission. https://design-system.service.gov.uk/patterns/check-answers/

Implementation: one form with car/symptoms, visit details and contact groups, followed by editable review and then a receipt. Appointment date/time are preferences in Kerman time. No invented live slots or prices. Keep expert visit as default and preserve collection/drop-off alternatives for existing workflows.

Reuse ServiceRequestInput, validateServiceRequest, RequestValidationError and DemoCaseProvider.submitRequest. Creating a request is not assessment consent, confirmed availability, payment or repair approval. The assessment fee is disclosed and approved before the visit and remains payable if further service is declined. Investigation and transport are separately authorized.

Acceptance criteria:
1. Existing /case/new callers reach the new design; other application screens keep existing styles.
2. Invalid input preserves values, identifies fields accessibly, and creates no case.
3. Review displays answers without saving; editing returns to populated fields.
4. Final action creates exactly one browser-persisted pending case, with no automatic confirmation or authorization.
5. Storage failure shows recovery without losing form values or false success.
6. Verify responsive overflow, keyboard/error/review focus, reduced motion, refresh persistence and downstream request/assessment gates.

Use near-black, warm off-white, restrained red, Alexandria and one concept assessment photo. Form usability takes priority over landing animation. Only fictional data; no real bookings, customer messages, payments or deployment. Research informs the interface, not claims about Fixauto coverage or guarantees.
