import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Talent Resources | Set Life Casting",
  description:
    "Resources for background actors including photo submission guidelines, set etiquette, and tips for success in the extras casting industry.",
};

export default function ResourcesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-light to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-secondary mb-6">
              Talent Resources
            </h1>
            <p className="text-xl text-secondary-light leading-relaxed">
              Everything you need to know to succeed as a background actor
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Getting Started
            </h2>
            <p className="text-xl text-secondary-light">
              Ready to become a background actor? Here&apos;s what you need to
              know.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Follow Us on Facebook",
                description:
                  "All casting calls are posted on our Facebook page. Make sure to follow us and turn on notifications!",
                icon: "📱",
                link: "https://www.facebook.com/SetLifeCastingATL/",
              },
              {
                title: "Prepare Your Photos",
                description:
                  "Have recent, clear headshots and full-body photos ready. See our photo guidelines below.",
                icon: "📸",
                link: "#photos",
              },
              {
                title: "Stay Professional",
                description:
                  "Punctuality, preparation, and professionalism are key to success on set.",
                icon: "⭐",
                link: "#etiquette",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-primary-light rounded-2xl p-6 text-center"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-secondary mb-3">
                  {item.title}
                </h3>
                <p className="text-secondary-light mb-4">{item.description}</p>
                <a
                  href={item.link}
                  className="text-accent hover:text-accent-dark font-semibold inline-flex items-center"
                >
                  Learn More
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Guidelines */}
      <section id="photos" className="py-20 bg-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Photo Submission Guidelines
            </h2>
            <p className="text-xl text-secondary-light">
              Your photos are your first impression. Here&apos;s how to make them
              count.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-secondary mb-6">DO:</h3>
              <ul className="space-y-4">
                {[
                  "Use natural lighting (outdoors or near a window)",
                  "Choose a plain, neutral background",
                  "Show your face clearly with a friendly expression",
                  "Include a full-body shot in neutral clothing",
                  "Make sure photos are recent (within 6 months)",
                  "Use high-resolution images",
                  "Show your natural look (minimal makeup)",
                  "Include photos from different angles",
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-secondary-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-secondary mb-6">
                DON&apos;T:
              </h3>
              <ul className="space-y-4">
                {[
                  "Use heavily filtered or edited photos",
                  "Include group photos or photos with others",
                  "Wear sunglasses or hats that hide your face",
                  "Submit blurry or low-quality images",
                  "Use old photos that don't reflect your current look",
                  "Include excessive makeup or styling",
                  "Take photos in cluttered locations",
                  "Use selfies with extreme angles",
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg
                      className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-secondary-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-2xl p-8">
            <h3 className="text-xl font-bold text-secondary mb-4">
              Photo Examples
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Headshot - Front",
                "Headshot - Side Profile",
                "Full Body - Front",
                "Full Body - Side",
              ].map((label) => (
                <div
                  key={label}
                  className="aspect-[3/4] bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg flex items-center justify-center text-center p-4"
                >
                  <div>
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-sm font-semibold text-secondary">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Set Etiquette */}
      <section id="etiquette" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              On-Set Etiquette
            </h2>
            <p className="text-xl text-secondary-light">
              Professional behavior on set ensures you&apos;ll be called back for
              future projects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Before You Arrive",
                tips: [
                  "Confirm your call time and location",
                  "Get a good night's sleep",
                  "Bring the requested wardrobe",
                  "Eat before arriving (unless meals are provided)",
                  "Arrive 15 minutes early",
                  "Silence your phone",
                ],
              },
              {
                title: "On Set Behavior",
                tips: [
                  "Follow all directions from ADs and crew",
                  "Stay quiet during filming",
                  "Don't touch equipment or props",
                  "Be patient during long setups",
                  "Ask permission before taking photos",
                  "Respect other actors' space",
                ],
              },
              {
                title: "What to Bring",
                tips: [
                  "Valid ID and work documentation",
                  "Snacks and water bottle",
                  "Phone charger",
                  "Book or entertainment for downtime",
                  "Requested wardrobe options",
                  "Comfortable shoes for standing",
                ],
              },
              {
                title: "What NOT to Do",
                tips: [
                  "Approach principal actors",
                  "Post on social media without permission",
                  "Leave without checking out",
                  "Cause distractions or noise",
                  "Complain about wait times",
                  "Ask for autographs or selfies",
                ],
              },
            ].map((section) => (
              <div
                key={section.title}
                className="bg-primary-light rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-secondary mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.tips.map((tip) => (
                    <li key={tip} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-accent mr-2 flex-shrink-0 mt-0.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-secondary-light">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Join Our Talent Network?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Follow us on Facebook to see current casting calls and opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.facebook.com/SetLifeCastingATL/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Follow on Facebook
              </Button>
            </a>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-accent"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
