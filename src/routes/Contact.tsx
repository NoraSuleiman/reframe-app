import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { DEPOT } from '@/data/seed/buildings';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="container-content py-section">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-2 font-display text-h1">Get in touch</h1>
          <p className="mt-4 max-w-prose text-body text-stone">
            Questions about a material, bulk reclamation, or hosting your own deconstructed stock on
            ReFrame? Send a note and the depot team will respond.
          </p>

          <dl className="mt-8 space-y-4 text-body-sm">
            <div>
              <dt className="text-caption text-stone">Depot</dt>
              <dd className="font-medium text-graphite">{DEPOT}</dd>
            </div>
            <div>
              <dt className="text-caption text-stone">Email</dt>
              <dd className="font-medium text-graphite">hello@reframe.studio</dd>
            </div>
            <div>
              <dt className="text-caption text-stone">Council area</dt>
              <dd className="font-medium text-graphite">City of Sydney</dd>
            </div>
          </dl>
          <p className="mt-6 text-caption text-stone">
            Contact details are placeholders for the prototype.
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-surface-raised p-6 shadow-card">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-moss-tint text-moss">
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h2 className="mt-4 font-display text-h4">Message sent</h2>
              <p className="mt-2 text-body-sm text-stone">Thanks — we’ll be in touch shortly.</p>
              <Button variant="secondary" className="mt-5" onClick={() => setSent(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="c-name" required>
                  <Input id="c-name" required />
                </Field>
                <Field label="Email" htmlFor="c-email" required>
                  <Input id="c-email" type="email" required />
                </Field>
              </div>
              <Field label="Organisation" htmlFor="c-org">
                <Input id="c-org" />
              </Field>
              <Field label="Message" htmlFor="c-msg" required>
                <Textarea id="c-msg" rows={5} required />
              </Field>
              <Button type="submit" size="lg" className="w-full">
                Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
