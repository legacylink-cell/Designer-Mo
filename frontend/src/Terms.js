import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Section = ({ n, title, children }) => (
  <section className="border-t border-[#D5D3CB] py-10">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
      <div className="md:col-span-3">
        <span className="font-mono text-xs tracking-[0.22em] text-[#595959] uppercase">
          §{n}
        </span>
        <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-tight mt-2">
          {title}
        </h2>
      </div>
      <div className="md:col-span-9 prose-mo">{children}</div>
    </div>
  </section>
);

const P = ({ children }) => (
  <p className="text-base md:text-[1.05rem] leading-relaxed text-[#1A1A1A] mb-4">
    {children}
  </p>
);

const Bullet = ({ children }) => (
  <li className="text-base leading-relaxed text-[#1A1A1A] mb-2 flex gap-3">
    <span className="text-[#E83B22] mt-[0.45rem] inline-block w-2 h-[2px] bg-[#E83B22] flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const Terms = () => (
  <div className="min-h-screen bg-[#F3F2ED] text-[#121212]">
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#F3F2ED]/85 border-b border-[#D5D3CB]">
      <div className="max-w-5xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-2xl tracking-tighter"
          data-testid="terms-home-link"
        >
          <ArrowLeft size={16} /> Mo<span className="text-[#E83B22]">.</span>
        </Link>
        <span className="overline hidden sm:inline">/ Terms</span>
      </div>
    </header>

    <main className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20">
      <div className="overline">Legal</div>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tighter mt-3">
        Terms &amp; Conditions<span className="text-[#E83B22]">.</span>
      </h1>
      <p className="mt-6 text-lg text-[#595959] max-w-3xl">
        The agreement that governs every project, retainer, and deliverable
        between Mo Studio (Mohamed Abou Zeid, Texas, USA — &quot;<strong>Studio</strong>,&quot;
        &quot;<strong>I</strong>,&quot; or &quot;<strong>me</strong>&quot;) and you (the &quot;<strong>Client</strong>&quot;).
      </p>
      <p className="mt-3 font-mono text-xs text-[#595959] tracking-wider">
        Last updated: {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* Acceptance callout */}
      <div className="mt-12 border border-[#121212] bg-[#EAE9E4] p-6 md:p-8">
        <div className="overline mb-2">Acceptance</div>
        <p className="text-base md:text-lg leading-relaxed">
          By engaging Mo Studio for any service — whether by replying
          &quot;yes,&quot; &quot;let&apos;s go,&quot; or any equivalent confirmation via
          <strong> email, text, chat, or signed proposal</strong>; or by
          submitting <strong>any payment</strong> for an agreed-upon scope —
          you acknowledge that you have read these Terms &amp; Conditions and
          agree to be legally bound by them in their entirety. No additional
          signature is required for these Terms to take effect.
        </p>
      </div>

      <Section n="01" title="Scope of services">
        <P>
          Mo Studio provides web design, web development, search engine
          optimization (SEO), website maintenance, and related digital design
          services. The exact deliverables, timeline, and price for any
          engagement are documented in a written proposal, quote, or invoice
          (the &quot;<strong>Engagement</strong>&quot;) which incorporates these Terms by reference.
        </P>
        <P>
          Anything not expressly listed in the Engagement is out of scope. Out-of-scope
          requests will be billed separately at my then-current rates or as a fixed
          add-on, after written agreement from both parties.
        </P>
      </Section>

      <Section n="02" title="Payment terms">
        <ul className="space-y-2 mb-4">
          <Bullet>
            <strong>Project fees are paid 100% upfront</strong> once the scope
            is agreed and the brief is fully submitted. Work begins only after
            payment is received.
          </Bullet>
          <Bullet>
            <strong>Project payments are non-refundable</strong> once work has
            commenced, regardless of the Client&apos;s subsequent decision to
            cancel, reduce scope, or fail to provide required materials.
          </Bullet>
          <Bullet>
            <strong>Monthly maintenance retainers are billed in advance</strong>
            on the 1st of each month, for the upcoming month&apos;s service. No
            partial-month refunds.
          </Bullet>
          <Bullet>
            All prices are in <strong>U.S. Dollars (USD)</strong> and
            exclusive of any applicable sales tax, VAT, or transaction fees,
            which are the Client&apos;s responsibility where applicable.
          </Bullet>
          <Bullet>
            Invoices and receipts are available on request at any time.
          </Bullet>
          <Bullet>
            Late maintenance payments accrue a <strong>5% late fee per
            week</strong> after a 7-day grace period. Service may be paused
            after 14 days&apos; non-payment.
          </Bullet>
        </ul>
      </Section>

      <Section n="03" title="Client responsibilities">
        <P>
          To deliver on time and on budget, I rely on the Client to provide:
        </P>
        <ul className="space-y-2">
          <Bullet>
            A complete brief covering goals, audience, content, and any brand
            constraints, before the project begins.
          </Bullet>
          <Bullet>
            All copy, photography, logos, and other assets the Client wants
            featured. If I am to source or write content, that must be in the
            Engagement as a paid add-on.
          </Bullet>
          <Bullet>
            Timely feedback. Project timelines assume Client feedback within
            <strong> 3 business days</strong> at each milestone. Delays beyond
            this may extend the timeline and, in extended cases, restart the
            project as a new Engagement.
          </Bullet>
          <Bullet>
            Accurate and up-to-date contact info, billing details, and any
            third-party credentials (domain registrar, hosting, analytics)
            needed to complete the work.
          </Bullet>
        </ul>
      </Section>

      <Section n="04" title="Revisions & approvals">
        <P>
          Each Engagement specifies a number of revision rounds (e.g.
          1 round on Starter, 3 on Professional, unlimited on Premium). A
          &quot;round&quot; is a single consolidated set of feedback delivered
          in writing.
        </P>
        <P>
          Once a milestone is approved in writing (including by email or chat
          message), it is considered final. Subsequent changes to approved
          work are billed as out-of-scope unless explicitly covered by the
          Engagement.
        </P>
      </Section>

      <Section n="05" title="Timeline">
        <P>
          Estimated delivery timelines are stated in the Engagement and assume
          the Client meets the responsibilities in §03. The timeline begins
          on the later of (a) full payment received and (b) full brief
          received. Force majeure events (illness, natural disaster,
          third-party platform outages) extend the timeline without penalty.
        </P>
      </Section>

      <Section n="06" title="Intellectual property">
        <P>
          Upon full payment, the Client owns all final deliverables — final
          design files, source code, copy, and visual assets — and may use,
          modify, or transfer them without restriction.
        </P>
        <P>
          The Studio retains the right to display the completed work in its
          portfolio (including on mohamedabouzeid.com, on social media, and in
          design-industry publications) and to describe the engagement at a
          high level, unless the Engagement specifies an NDA or written
          confidentiality clause.
        </P>
        <P>
          Pre-existing intellectual property, third-party assets (fonts, stock
          imagery, plugins, libraries), and proprietary tooling remain the
          property of their respective owners. The Studio licenses such
          third-party assets on the Client&apos;s behalf where required and
          passes through any associated costs.
        </P>
      </Section>

      <Section n="07" title="Maintenance — opt-out & handover">
        <P>
          Monthly maintenance retainers continue indefinitely until cancelled
          by either party with at least <strong>30 days&apos; written notice</strong>
          (email is sufficient). Upon cancellation:
        </P>
        <ul className="space-y-2">
          <Bullet>The Client&apos;s final monthly invoice is billed in full and is non-refundable, covering both the final month of service and the handover work below.</Bullet>
          <Bullet>I export the codebase and all assets to a Git repository or download package the Client controls.</Bullet>
          <Bullet>I transfer ownership of any DNS records, CMS accounts, analytics dashboards, and third-party services that the Studio set up on the Client&apos;s behalf.</Bullet>
          <Bullet>After handover, the Studio is no longer responsible for site uptime, security patches, or any aspect of the Client&apos;s operation of the site.</Bullet>
        </ul>
      </Section>

      <Section n="08" title="Confidentiality">
        <P>
          Each party will treat the other&apos;s non-public business information
          (financials, customer data, unreleased products) as confidential
          and will not disclose it to third parties without consent, except as
          required by law.
        </P>
      </Section>

      <Section n="09" title="Warranties & limitation of liability">
        <P>
          The Studio warrants that the deliverables will substantially conform
          to the Engagement and will be free of material defects for
          <strong> 30 days</strong> after launch. Defects reported within this
          window will be fixed at no additional cost.
        </P>
        <P>
          <strong>EXCEPT FOR THE EXPRESS WARRANTY ABOVE, ALL SERVICES AND
          DELIVERABLES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot;</strong> without
          warranty of any kind, express or implied, including but not limited
          to merchantability, fitness for a particular purpose, or
          non-infringement.
        </P>
        <P>
          To the maximum extent permitted by law, the Studio&apos;s total
          aggregate liability under any Engagement, regardless of the legal
          theory, shall not exceed the total fees paid by the Client to the
          Studio under that Engagement in the 12 months preceding the claim.
          The Studio is not liable for any indirect, incidental,
          consequential, or special damages, including lost profits, lost
          revenue, or loss of data.
        </P>
      </Section>

      <Section n="10" title="Indemnification">
        <P>
          The Client agrees to indemnify and hold harmless the Studio from
          any third-party claims arising from (a) content the Client supplied
          or directed the Studio to use, (b) the Client&apos;s use of the final
          deliverables in violation of any law or third-party right, or (c)
          the Client&apos;s breach of these Terms.
        </P>
      </Section>

      <Section n="11" title="Termination">
        <P>
          Either party may terminate an Engagement immediately for material
          breach if the other party fails to cure such breach within 14 days
          of written notice. Upon termination:
        </P>
        <ul className="space-y-2">
          <Bullet>All work completed up to the termination date is delivered to the Client.</Bullet>
          <Bullet>The Client remains liable for all amounts due under the Engagement; project payments already made are non-refundable per §02.</Bullet>
          <Bullet>The clauses of these Terms that by their nature should survive termination (intellectual property, confidentiality, liability, governing law) shall do so.</Bullet>
        </ul>
      </Section>

      <Section n="12" title="Force majeure">
        <P>
          Neither party is liable for failure or delay caused by events
          outside its reasonable control — including illness, natural
          disaster, war, government action, internet or hosting outages, or
          third-party platform failures — provided the affected party
          notifies the other promptly and resumes performance as soon as
          reasonably practicable.
        </P>
      </Section>

      <Section n="13" title="Independent contractor">
        <P>
          The Studio operates as an independent contractor. Nothing in these
          Terms creates a partnership, joint venture, employment, or agency
          relationship between the parties. The Studio retains sole
          discretion over working hours, location, and means of performance.
        </P>
      </Section>

      <Section n="14" title="Governing law & disputes">
        <P>
          These Terms are governed by the laws of the <strong>State of
          Texas, United States</strong>, without regard to its conflict-of-laws
          rules. The parties agree that any dispute shall first be submitted
          to good-faith negotiation for at least 30 days.
        </P>
        <P>
          If unresolved, disputes shall be settled by binding arbitration
          under the Commercial Arbitration Rules of the American Arbitration
          Association, conducted in Texas, USA, in English, by a single
          arbitrator. Judgment on the award may be entered in any court of
          competent jurisdiction. Each party bears its own costs and fees
          unless the arbitrator decides otherwise.
        </P>
      </Section>

      <Section n="15" title="Miscellaneous">
        <ul className="space-y-2">
          <Bullet><strong>Entire agreement.</strong> These Terms together with the applicable Engagement constitute the entire agreement and supersede all prior discussions.</Bullet>
          <Bullet><strong>Amendments.</strong> Changes to these Terms apply only to engagements entered into after the &quot;Last updated&quot; date above.</Bullet>
          <Bullet><strong>Severability.</strong> If any provision is held unenforceable, the remaining provisions stay in effect.</Bullet>
          <Bullet><strong>No waiver.</strong> Failure to enforce any provision does not waive that provision or any other.</Bullet>
          <Bullet><strong>Assignment.</strong> Neither party may assign these Terms without the other&apos;s prior written consent, except in connection with a merger, acquisition, or sale of substantially all assets.</Bullet>
          <Bullet><strong>Notices.</strong> Written notices to the Studio go to the email address on mohamedabouzeid.com. Notices to the Client go to the email on file.</Bullet>
        </ul>
      </Section>

      <div className="mt-16 pt-10 border-t border-[#121212] text-sm text-[#595959]">
        <p>
          Questions about these Terms? Email me through{" "}
          <Link to="/#contact" className="link-underline text-[#121212]">
            the contact form
          </Link>
          .
        </p>
        <p className="mt-2 font-mono text-xs">
          © {new Date().getFullYear()} Mohamed Abou Zeid · Mo Studio · Texas, USA
        </p>
      </div>
    </main>
  </div>
);

export default Terms;
