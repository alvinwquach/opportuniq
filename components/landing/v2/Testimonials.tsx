"use client";

const testimonials = [
  {
    quote:
      "I was about to call a plumber for what I thought was a burst pipe. The AI told me it was the AC condensate line — a $9 fix. I didn't even know that was a thing.",
    name: "Marcus R.",
    context: "Homeowner, Atlanta",
  },
  {
    quote:
      "My Porsche Cayenne started making a grinding noise on cold starts. I uploaded a video and the AI identified it as the transfer case actuator — not the engine. Dealer wanted $4,200. Independent shop fixed it for $800.",
    name: "Kevin L.",
    context: "Porsche Cayenne owner, Los Angeles",
  },
  {
    quote:
      "I asked in Cantonese. It answered in Cantonese. Then it found me a licensed electrician in my zip code and drafted the email. My English isn't perfect and this made everything easy.",
    name: "Adam A.",
    context: "Homeowner, San Francisco",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            Real stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            What people figured out
          </h2>
          <p className="text-xs text-gray-400 mt-3">Based on real diagnoses</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-7 flex flex-col"
            >
              <span className="text-4xl font-serif text-blue-200 leading-none mb-4 select-none">&ldquo;</span>
              <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-6">
                {t.quote}
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.context}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
