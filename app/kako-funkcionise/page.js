'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function KakoFunkcionise() {
  return (
    <div className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="bg-[#E6F1FB] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0C447C] mb-6 leading-tight">
            Kupi i prodaj pametnije, <br className="hidden sm:block" /> brže i sigurnije
          </h1>
          <p className="text-lg text-[#185FA5] mb-10 max-w-2xl mx-auto">
            Dobrodošli na Povoljno24.rs — platformu dizajniranu da spoji kupce i prodavce širom Srbije na najjednostavniji mogući način. Saznajte kako možete izvući maksimum iz našeg sajta.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/postoglas" className="bg-[#185FA5] hover:bg-[#0C447C] text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
              Započni prodaju
            </Link>
            <Link href="/" className="bg-white hover:bg-gray-50 text-[#185FA5] border border-[#185FA5] px-8 py-3.5 rounded-xl font-semibold transition-all shadow-sm">
              Istraži oglase
            </Link>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Za koga je Povoljno24?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Bilo da praznite tavan, pokrećete mali biznis, ili tražite odličnu ponudu — na pravom ste mestu.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 h-full flex flex-col justify-center transition-transform hover:-translate-y-1">
              <div className="text-5xl mb-6">🛒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Za Kupce</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Pronađite sve što vam je potrebno po najpovoljnijim cenama. Od elektronike do nekretnina, naša platforma vam omogućava da pretražujete, filtrirate i direktno komunicirate sa proverenim prodavcima bez skrivenih provizija.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3"><span className="text-[#1D9E75] text-xl">✓</span> Veliki izbor kategorija</li>
                <li className="flex items-center gap-3"><span className="text-[#1D9E75] text-xl">✓</span> Sigurna komunikacija</li>
                <li className="flex items-center gap-3"><span className="text-[#1D9E75] text-xl">✓</span> Bez posrednika i provizija</li>
              </ul>
            </div>

            <div className="bg-[#f0f7fd] p-10 rounded-3xl border border-[#d6ebfa] h-full flex flex-col justify-center transition-transform hover:-translate-y-1">
              <div className="text-5xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold text-[#0C447C] mb-4">Za Prodavce</h3>
              <p className="text-[#185FA5] mb-6 leading-relaxed">
                Pretvorite stvari koje vam više ne trebaju u novac ili proširite svoj posao. Postavljanje oglasa je brzo, jednostavno i potpuno besplatno. Vaš oglas će videti hiljade potencijalnih kupaca.
              </p>
              <ul className="space-y-3 text-[#185FA5]">
                <li className="flex items-center gap-3"><span className="text-[#0C447C] text-xl">✓</span> Besplatno oglašavanje</li>
                <li className="flex items-center gap-3"><span className="text-[#0C447C] text-xl">✓</span> Ogroman doseg publike</li>
                <li className="flex items-center gap-3"><span className="text-[#0C447C] text-xl">✓</span> Intuitivno upravljanje oglasima</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Kako funkcioniše u 3 koraka</h2>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative z-10">
              <div className="w-16 h-16 bg-[#E6F1FB] text-[#185FA5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kreiraj nalog</h3>
              <p className="text-gray-600 leading-relaxed">
                Registracija traje manje od minuta. Potrebna vam je samo email adresa kako biste počeli sa kupovinom ili prodajom.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative z-10">
              <div className="w-16 h-16 bg-[#E6F1FB] text-[#185FA5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Postavi ili Pronađi</h3>
              <p className="text-gray-600 leading-relaxed">
                Dodajte fotografije, opis i cenu za vaš predmet, ili pretražite našu bazu oglasa koristeći napredne filtere.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative z-10">
              <div className="w-16 h-16 bg-[#E6F1FB] text-[#185FA5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dogovori se</h3>
              <p className="text-gray-600 leading-relaxed">
                Stupite u kontakt putem našeg bezbednog sistema za poruke. Dogovorite preuzimanje i završite transakciju.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Zašto izabrati Povoljno24?</h2>
          
          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="flex gap-4">
              <div className="text-[#1D9E75] text-3xl shrink-0">🛡️</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Sigurnost na prvom mestu</h4>
                <p className="text-gray-600">Svi korisnici prolaze kroz proces verifikacije, a naš sistem za prijavu sumnjivih oglasa radi 24/7 kako bi vas zaštitio.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-[#1D9E75] text-3xl shrink-0">⚡</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Brzina i efikasnost</h4>
                <p className="text-gray-600">Zahvaljujući modernom dizajnu i pametnoj pretrazi, pronalaženje onoga što vam treba nikada nije bilo brže.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-[#1D9E75] text-3xl shrink-0">💬</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Integrisane poruke</h4>
                <p className="text-gray-600">Nema potrebe za razmenom brojeva telefona odmah. Komunicirajte bezbedno unutar platforme.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-[#1D9E75] text-3xl shrink-0">📱</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Prilagođeno svim uređajima</h4>
                <p className="text-gray-600">Kupujte i prodajte u pokretu. Naš sajt savršeno radi na mobilnim telefonima, tabletima i računarima.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#185FA5] py-16 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Spremni da počnete?</h2>
        <p className="text-[#d6ebfa] text-lg mb-8 max-w-2xl mx-auto">
          Pridružite se hiljadama zadovoljnih korisnika i postanite deo najveće rastuće zajednice za kupovinu i prodaju u Srbiji.
        </p>
        <Link href="/register" className="inline-block bg-white text-[#185FA5] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
          Kreiraj besplatan nalog
        </Link>
      </section>
    </div>
  );
}
