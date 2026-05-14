import {
  privacyContact,
  privacyCookieItems,
  privacyDefinitions,
  privacyDefinitionsIntro,
  privacyInterpretationParagraph,
  privacyIntroParagraphs,
  privacyLastUpdated,
  privacyPageTitle,
  privacySections,
} from "./privacy-content";

export function PrivacyPageContent({
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
  const h3ClassName = isAppVariant
    ? "mt-6 mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
    : "mt-6 mb-2 text-xl font-semibold text-gray-900";
  const h4ClassName = isAppVariant
    ? "mt-4 mb-2 text-lg font-medium text-gray-900 dark:text-gray-100"
    : "mt-4 mb-2 text-lg font-medium text-gray-900";
  const listClassName = "list-disc space-y-2 pl-6";
  const compactListClassName = "list-disc space-y-1 pl-6";
  const linkClassName = isAppVariant
    ? "text-[#201a7c] hover:underline dark:text-[#7b75ef]"
    : "text-blue-600 hover:underline";
  const cookieCardClassName = isAppVariant
    ? "rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
    : "rounded-lg bg-gray-50 p-4";

  return (
    <section className={outerSectionClassName}>
      <div className={containerClassName}>
        <div className={cardClassName}>
          <h1 className={titleClassName}>{privacyPageTitle}</h1>
          <p className={metaClassName}>Last updated: {privacyLastUpdated}</p>

          <div className={proseClassName}>
            {privacyIntroParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <h2 className={headingClassName}>Interpretation and Definitions</h2>

            <h3 className={h3ClassName}>Interpretation</h3>
            <p>{privacyInterpretationParagraph}</p>

            <h3 className={h3ClassName}>Definitions</h3>
            <p>{privacyDefinitionsIntro}</p>
            <ul className={listClassName}>
              {privacyDefinitions.map((item) => (
                <li key={item.term}>
                  <strong>{item.term}</strong> {item.description}
                </li>
              ))}
            </ul>

            {privacySections.map((section) => (
              <div key={section.title}>
                <h2 className={headingClassName}>{section.title}</h2>
                {section.subSections?.map((subSection) => {
                  const SubTag = subSection.level === "h4" ? "h4" : "h3";
                  const subClassName =
                    subSection.level === "h4" ? h4ClassName : h3ClassName;
                  return (
                    <div key={`${section.title}-${subSection.title}`}>
                      <SubTag className={subClassName}>{subSection.title}</SubTag>
                      {subSection.paragraphs?.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {subSection.bullets ? (
                        <ul
                          className={
                            subSection.level === "h4"
                              ? compactListClassName
                              : listClassName
                          }
                        >
                          {subSection.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul
                    className={
                      section.title === "Disclosure of Your Personal Data"
                        ? compactListClassName
                        : listClassName
                    }
                  >
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}

                {section.title === "Collecting and Using Your Personal Data" ? (
                  <div className="space-y-4">
                    {privacyCookieItems.map((item) => (
                      <div key={item.title} className={cookieCardClassName}>
                        <p className={h4ClassName}>{item.title}</p>
                        <p className="text-sm">Type: {item.type}</p>
                        <p className="text-sm">Administered by: {item.administeredBy}</p>
                        <p className="mt-2 text-sm">Purpose: {item.purpose}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            <h2 className={headingClassName}>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, You can contact us:</p>
            <ul className={listClassName}>
              <li>
                By email:{" "}
                <a href={`mailto:${privacyContact.email}`} className={linkClassName}>
                  {privacyContact.email}
                </a>
              </li>
              <li>
                By visiting this page on our website:{" "}
                <a href={privacyContact.contactPageUrl} className={linkClassName}>
                  {privacyContact.contactPageUrl}
                </a>
              </li>
              <li>By phone number: {privacyContact.phone}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
