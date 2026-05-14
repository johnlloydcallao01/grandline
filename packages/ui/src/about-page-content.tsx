import Image from "next/image";

import {
  aboutBackgroundImage,
  aboutBackgroundParagraphs,
  aboutBackgroundTitle,
  aboutImpactDescription,
  aboutImpactHeading,
  aboutImpactStats,
  aboutImpactSubheading,
  aboutMission,
  aboutTeamDescription,
  aboutTeamHeading,
  aboutValues,
  aboutValuesDescription,
  aboutValuesHeading,
  aboutVision,
} from "./about-content";

export interface CompanyMember {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  position: string;
  bio?: string;
  profilePicture?: {
    cloudinaryURL: string;
  };
  isActive: boolean;
}

interface AboutPageContentProps {
  variant?: "landing" | "app";
}

function getCompanyMemberName(member: CompanyMember) {
  return member.middleName
    ? `${member.firstName} ${member.middleName} ${member.lastName}`
    : `${member.firstName} ${member.lastName}`;
}

function getCompanyMemberImage(member: CompanyMember) {
  return (
    member.profilePicture?.cloudinaryURL ||
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
  );
}

export async function AboutPageContent({
  variant = "landing",
}: AboutPageContentProps) {
  const isAppVariant = variant === "app";
  const companyMembers: CompanyMember[] = [];

  if (isAppVariant) {
    return (
      <div className="w-full px-[10px] py-6 md:py-8">
        <div className="space-y-8">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 md:text-3xl">
                {aboutBackgroundTitle}
              </h2>
              <div className="mt-5 space-y-4">
                {aboutBackgroundParagraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-gray-600 dark:text-gray-300 md:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm">
              <Image
                src={aboutBackgroundImage.src}
                alt={aboutBackgroundImage.alt}
                width={600}
                height={400}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] px-4 py-3 shadow-sm">
                <div className="text-2xl font-bold text-[#201a7c] dark:text-[#7b75ef]">
                  {aboutBackgroundImage.statValue}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {aboutBackgroundImage.statLabel}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[aboutMission, aboutVision].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm md:p-8"
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBackgroundClassName}`}
                >
                  <i className={`${item.icon} ${item.iconColorClassName} text-2xl`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300 md:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </section>

          <section className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 md:text-2xl">
                {aboutValuesHeading}
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400 md:text-base">
                {aboutValuesDescription}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {aboutValues.map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-sm"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#201a7c] to-[#ab3b43]">
                    <i className={`${value.icon} text-xl text-white`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {companyMembers.length > 0 && (
            <section className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 md:text-2xl">
                  {aboutTeamHeading}
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400 md:text-base">
                  {aboutTeamDescription}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {companyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-sm"
                  >
                    <Image
                      src={getCompanyMemberImage(member)}
                      alt={getCompanyMemberName(member)}
                      width={300}
                      height={300}
                      className="h-64 w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {getCompanyMemberName(member)}
                      </h3>
                      <p className="mt-2 font-medium text-[#201a7c] dark:text-[#7b75ef]">
                        {member.position}
                      </p>
                      {member.bio && (
                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#201a7c] to-[#ab3b43] px-6 py-8 text-center shadow-sm md:px-8 md:py-10">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              {aboutImpactHeading}
            </h2>
            <p className="mt-3 text-lg font-semibold text-white">
              {aboutImpactSubheading}
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-blue-100 md:text-base">
              {aboutImpactDescription}
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {aboutImpactStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl font-bold text-white md:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-6">
                {aboutBackgroundTitle}
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {aboutBackgroundParagraphs[0]}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {aboutBackgroundParagraphs[1]}
              </p>
            </div>
            <div className="relative">
              <Image
                src={aboutBackgroundImage.src}
                alt={aboutBackgroundImage.alt}
                width={600}
                height={400}
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {aboutBackgroundImage.statValue}
                </div>
                <div className="text-gray-600 text-sm">
                  {aboutBackgroundImage.statLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[aboutMission, aboutVision].map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-2xl shadow-lg">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${item.iconBackgroundClassName}`}
                >
                  <i className={`${item.icon} text-2xl ${item.iconColorClassName}`} />
                </div>
                <h3 className="heading-secondary text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
              {aboutValuesHeading}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {aboutValuesDescription}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutValues.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#201a7c] to-[#ab3b43] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className={`${value.icon} text-2xl text-white`} />
                </div>
                <h3 className="heading-secondary text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {companyMembers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="heading-primary text-3xl md:text-4xl text-gray-900 mb-4">
                {aboutTeamHeading}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {aboutTeamDescription}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover"
                >
                  <Image
                    src={getCompanyMemberImage(member)}
                    alt={getCompanyMemberName(member)}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="heading-secondary text-xl font-semibold text-gray-900 mb-2">
                      {getCompanyMemberName(member)}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">
                      {member.position}
                    </p>
                    {member.bio && (
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-gradient-to-r from-[#201a7c] to-[#ab3b43]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-primary text-3xl md:text-4xl text-white mb-4">
              {aboutImpactHeading}
            </h2>
            <p className="text-xl text-white font-semibold mb-4">
              {aboutImpactSubheading}
            </p>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              {aboutImpactDescription}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutImpactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
