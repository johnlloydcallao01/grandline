import {
  termsContact,
  termsDefinitions,
  termsDefinitionsIntro,
  termsInterpretationParagraph,
  termsInterpretationTitle,
  termsIntro,
  termsLastUpdated,
  termsPageTitle,
  termsSections,
} from "./terms-content";

export function TermsPageContent({
  variant = "landing",
}: {
  variant?: "landing" | "app";
}) {
  const isAppVariant = variant === "app";
  const outerSectionClassName = isAppVariant
    ? "w-full px-[10px] py-6 md:py-8"
    : "bg-gray-50 pb-20 pt-24";
  const containerClassName = isAppVariant
    ? "w-full"
    : "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8";
  const cardClassName = isAppVariant
    ? "rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm md:p-8"
    : "rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-12";
  const titleClassName = isAppVariant
    ? "text-3xl font-bold text-gray-900 dark:text-gray-100 md:text-4xl"
    : "text-3xl font-bold text-gray-900 md:text-4xl";
  const metaClassName = isAppVariant
    ? "mb-8 text-gray-500 dark:text-gray-400"
    : "mb-8 text-gray-500";
  const proseClassName = isAppVariant
    ? "prose max-w-none space-y-6 text-gray-600 dark:prose-invert dark:text-gray-300"
    : "prose prose-blue max-w-none space-y-6 text-gray-600";
  const headingClassName = isAppVariant
    ? "mt-10 mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100"
    : "mt-10 mb-4 text-2xl font-bold text-gray-900";
  const subheadingClassName = isAppVariant
    ? "mt-6 mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
    : "mt-6 mb-2 text-xl font-semibold text-gray-900";
  const listClassName = "list-disc space-y-2 pl-6";
  const linkClassName = isAppVariant
    ? "text-[#201a7c] hover:underline dark:text-[#7b75ef]"
    : "text-blue-600 hover:underline";

  return (
    <section className={outerSectionClassName}>
      <div className={containerClassName}>
        <div className={cardClassName}>
          <h1 className={titleClassName}>{termsPageTitle}</h1>
          <p className={metaClassName}>Last updated: {termsLastUpdated}</p>

          <div className={proseClassName}>
            <p>{termsIntro}</p>

            <h2 className={headingClassName}>{termsInterpretationTitle}</h2>

            <h3 className={subheadingClassName}>Interpretation</h3>
            <p>{termsInterpretationParagraph}</p>

            <h3 className={subheadingClassName}>Definitions</h3>
            <p>{termsDefinitionsIntro}</p>
            <ul className={listClassName}>
              {termsDefinitions.map((item) => (
                <li key={item.term}>
                  <strong>{item.term}</strong> {item.description}
                </li>
              ))}
            </ul>

            {termsSections.map((section) => (
              <div key={section.title}>
                <h2 className={headingClassName}>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className={listClassName}>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}

            <h2 className={headingClassName}>Contact Us</h2>
            <p>
              If You have any questions about these Terms and Conditions, You can
              contact us:
            </p>
            <ul className={listClassName}>
              <li>
                By email:{" "}
                <a href={`mailto:${termsContact.email}`} className={linkClassName}>
                  {termsContact.email}
                </a>
              </li>
              <li>
                By visiting:{" "}
                <a href={termsContact.contactPageUrl} className={linkClassName}>
                  {termsContact.contactPageUrl}
                </a>
              </li>
              <li>By phone: {termsContact.phone}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
