export default function AboutKaamcha() {
    return (
        <section className="py-16 bg-white w-full">
            <div className="w-full px-4">
                <div className=" bg-gray-50 border border-green-100 rounded-2xl  p-10 w-full">
                    <h1 className="text-4xl font-bold text-green-700 mb-6 text-center">
                        About Kaam-Chaa
                    </h1>
                    <p className="text-lg text-gray-700 mb-6 text-center">
                        Kaam-Chaa is your trusted platform for connecting with skilled service providers in your area. Whether you need help with household repairs, cleaning, caregiving, or professional services, we make it easy to find reliable experts.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="flex flex-col items-center">
                            <img
                                src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=400&q=80"
                                alt="Kaam-Chaa Team"
                                className="rounded-xl shadow-lg mb-4 w-full max-w-xs object-cover"
                            />
                            <span className="text-green-700 font-semibold text-lg">
                                Friendly & Verified Professionals
                            </span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <ul className="space-y-4 text-gray-700 text-base">
                                <li>
                                    <span className="font-bold text-green-600">✔</span> Easy booking and quick matching
                                </li>
                                <li>
                                    <span className="font-bold text-green-600">✔</span> Secure payments and transparent pricing
                                </li>
                                <li>
                                    <span className="font-bold text-green-600">✔</span> Verified workers for peace of mind
                                </li>
                                <li>
                                    <span className="font-bold text-green-600">✔</span> 24/7 support for all your needs
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-10 text-center">
                        <span className="inline-block bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold shadow">
                            Empowering communities, one job at a time.
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}