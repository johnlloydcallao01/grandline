import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-24 pb-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cookies Policy</h1>
            <p className="text-gray-500 mb-8">Last updated: December 29, 2025</p>

            <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
              <p>
                This Cookies Policy explains what Cookies are and how We use them. You should read this policy so You can understand what type of Cookies We use, or the information We collect using Cookies and how that information is used.
              </p>

              <p>
                We display a Cookie Banner when You first visit our Website, asking for Your consent to set Non-Essential Cookies. You may manage Your preferences via that banner or by following the instructions below.
              </p>

              <p>
                Cookies do not typically contain any information that personally identifies a user, but personal information that We store about You may be linked to the information stored in and obtained from Cookies. For further information on how We use, store and keep Your personal data secure, see our Privacy Policy.
              </p>

              <p>
                We do not store sensitive personal information, such as mailing addresses, account passwords, etc., in the Cookies We use.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Interpretation and Definitions</h2>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Interpretation</h3>
              <p>
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Definitions</h3>
              <p>For the purposes of this Cookies Policy:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Company</strong> (referred to as either “the Company”, “We”, “Us” or “Our” in this Cookies Policy) refers to Grandline Maritime Training and Development Center Inc., Pierre N Paul Bldg. 505 A. Flores cor. A. Mabini Street, Ermita Manila, Manila, Philippines.</li>
                <li><strong>Cookies</strong> means small files that are placed on Your computer, mobile device or any other device by a website, containing details of Your browsing history on that website among its many uses.</li>
                <li><strong>Website</strong> refers to Grandline Maritime Training and Development Center Inc., accessible from <a href="https://grandlinemaritime.com" className="text-blue-600 hover:underline">https://grandlinemaritime.com</a>.</li>
                <li><strong>You</strong> means the individual accessing or using the Website, or a company, or any legal entity on behalf of which such individual is accessing or using the Website, as applicable.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The use of the Cookies</h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Type of Cookies We Use</h3>
              <p>
                Cookies can either be “Persistent” or “Session” Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.
              </p>
              <p>
                We use both Session and Persistent Cookies for the purposes set out below:
              </p>

              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Necessary / Essential Cookies</h4>
                  <p className="text-sm text-gray-500 mb-2">Type: Session Cookies | Administered by: Us</p>
                  <p className="text-gray-600">
                    Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Functionality Cookies</h4>
                  <p className="text-sm text-gray-500 mb-2">Type: Persistent Cookies | Administered by: Us</p>
                  <p className="text-gray-600">
                    Purpose: These Cookies allow Us to remember choices You make when You use the Website, such as remembering Your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter Your preferences every time You use the Website.
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-gray-500 mb-2">Type: Persistent Cookies | Administered by: Us (with third-party providers)</p>
                  <p className="text-gray-600">
                    Purpose: We use Analytics Cookies (for example, Google Analytics) to collect information about how You interact with our Website, such as pages visited, time spent on pages, and how You arrived at our site. This helps Us to improve the functionality and performance of our Website and better understand Our audience.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Your Choices Regarding Cookies</h2>
              <p>
                If You prefer to avoid the use of Cookies on the Website, first You must disable the use of Cookies in Your browser and then delete the Cookies saved in Your browser associated with this website. You may use this option for preventing the use of Cookies at any time.
              </p>
              <p>
                If You do not accept Our Cookies, You may experience some inconvenience in Your use of the Website and some features may not function properly.
              </p>
              <p>
                If You’d like to delete Cookies or instruct Your web browser to delete or refuse Cookies, please visit the help pages of Your web browser:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>For the Chrome web browser, please visit this page from Google: <a href="https://support.google.com/accounts/answer/32050" className="text-blue-600 hover:underline" target="_blank">https://support.google.com/accounts/answer/32050</a></li>
                <li>For the Internet Explorer web browser, please visit this page from Microsoft: <a href="http://support.microsoft.com/kb/278835" className="text-blue-600 hover:underline" target="_blank">http://support.microsoft.com/kb/278835</a></li>
                <li>For the Firefox web browser, please visit this page from Mozilla: <a href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored" className="text-blue-600 hover:underline" target="_blank">https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored</a></li>
                <li>For the Safari web browser, please visit this page from Apple: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-blue-600 hover:underline" target="_blank">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a></li>
              </ul>
              <p>For any other web browser, please visit Your web browser’s official web pages.</p>

              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">More Information about Cookies</h2>
              <p>
                You can learn more about cookies: <a href="https://www.allaboutcookies.org/" className="text-blue-600 hover:underline" target="_blank">Cookies: What Do They Do?</a>.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Contact Us</h2>
              <p>If You have any questions about this Cookies Policy, You can contact us:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>By email: <a href="mailto:info@grandlinemaritime.com" className="text-blue-600 hover:underline">info@grandlinemaritime.com</a></li>
                <li>By visiting this page on our website: <a href="https://grandlinemaritime.com/contact-us/" className="text-blue-600 hover:underline">https://grandlinemaritime.com/contact-us/</a></li>
                <li>By phone number: +63 991 551 5296</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
