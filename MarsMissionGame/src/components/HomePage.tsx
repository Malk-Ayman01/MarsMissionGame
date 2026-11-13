import React from 'react';
import { PixelIcon } from './PixelIcon';

interface HomePageProps {
  onStart: () => void;
}

export default function HomePage({ onStart }: HomePageProps) {
  return (
    <main className="relative w-full h-full min-h-screen overflow-y-auto bg-[#0c0706] text-[#e5e7eb]">

      <div className="fixed inset-0 pointer-events-none">
        <img
          src="/assets/nasa/jezero_crater.jpg"
          alt="Mars Jezero Crater"
          style={{ imageRendering: 'auto' }}
          className="w-full h-full object-cover brightness-[0.38] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0706]/75 via-[#0c0706]/45 to-[#0c0706]" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">

        <header className="flex items-center justify-between px-6 sm:px-12 py-5 border-b-4 border-[#49302b] bg-[#0c0706]/80">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 animate-pulse" />
            <span className="font-mono-hud text-xs sm:text-sm tracking-[0.18em] text-orange-300 font-bold">
              ARES PROGRAM
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono-hud text-[#b8a49e]">
            <PixelIcon name="satellite" className="w-4 h-4 text-red-400" />
            EARTH // MARS CONNECTION
          </div>
        </header>

        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
          <div className="flex items-center gap-2 px-4 py-2 pixel-box-red bg-[#24100d] text-red-300 font-mono-hud text-[10px] sm:text-xs tracking-widest mb-8">
            <PixelIcon name="radio" className="w-4 h-4 animate-pulse" />
            YOU ARE MISSION RESCUE LEAD
          </div>

          <p className="font-mono-hud text-xs sm:text-sm tracking-[0.3em] text-[#b8a49e] mb-4">
            YOUR CREW NEEDS YOU ON
          </p>

          <h1 className="font-title text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-white drop-shadow-[4px_4px_0_#020302]">
            MARS
            <span className="block text-[#dc6547] mt-2">MISSION</span>
          </h1>

          <div className="w-24 h-1 bg-[#dc6547] my-7" />

          <h2 className="font-title text-sm sm:text-xl tracking-[0.16em] text-[#e5a18b] uppercase">
            Protect Your Crew &amp; Bring Everyone Home
          </h2>

          <p className="max-w-2xl mt-6 text-xs sm:text-sm leading-8 text-[#c5b4ae]">
            After landing at Jezero Crater, an emergency breaks your return ship and cuts off Earth.
            <strong className="text-white"> It is up to you</strong> to guide Hazaloom, Hedeya, and Samantha—using real NASA science to balance air, power, and radiation shielding and bring everyone safely home!
          </p>

          <button
            type="button"
            onClick={onStart}
            className="group mt-10 pixel-btn flex items-center justify-center gap-3 px-8 py-4 bg-[#dc6547] hover:bg-[#ef795b] text-[#0c0706] font-title text-xs sm:text-sm tracking-wider cursor-pointer"
          >
            <PixelIcon name="rocket" className="w-5 h-5" />
            <span>ACCEPT RESCUE MISSION</span>
            <PixelIcon name="chevronRight" className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 w-full max-w-3xl">
            {[
              { label: 'LOCATION', value: 'JEZERO CRATER' },
              { label: 'CREW', value: 'HAZALOOM · HEDEYA · SAMANTHA' },
              { label: 'MISSIONS', value: '3 INTERACTIVE STAGES' },
            ].map((item) => (
              <div
                key={item.label}
                className="pixel-box bg-[#140b09]/95 p-4 text-left"
              >
                <p className="font-mono-hud text-[10px] tracking-widest text-[#9b8580]">
                  {item.label}
                </p>
                <p className="font-mono-hud text-xs sm:text-sm font-bold text-[#e5a18b] mt-2">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="px-6 sm:px-12 py-4 border-t-4 border-[#49302b] bg-[#0c0706]/85 flex flex-col sm:flex-row justify-between gap-2 text-[10px] font-mono-hud text-[#806b65]">
          <span>ARES-1 // MARS EXPLORATION PROGRAM</span>
          <span>MISSION CONTROL // READY TO LAUNCH</span>
        </footer>
      </div>
    </main>
  );
}
