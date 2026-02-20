function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export default function Footer({ lastUpdated }: { lastUpdated: string }) {
  return (
    <footer className="mt-16 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Helping B.Tech students make informed decisions about entrance exam applications.
            </p>
          </div>

          {/* Quick Tips */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Set calendar reminders</li>
              <li>• Keep documents ready</li>
              <li>• Don&apos;t skip state exams</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Disclaimer</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Always verify dates and fees on official websites before applying.
            </p>
          </div>
        </div>

        {/* Buy Me a Coffee */}
        <div className="border-t border-gray-200 pt-8 pb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Found this helpful?
            </p>
            <a
              href="https://buymeacoffee.com/show173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-5 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              ☕ Buy Me a Coffee
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">
            Crafted with <span className="text-red-500">❤️</span> in <strong>Bengaluru</strong>, India
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Data last updated: <span className="font-semibold">{formatDate(lastUpdated)}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
