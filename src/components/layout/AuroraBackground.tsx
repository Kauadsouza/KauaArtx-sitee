/* Céu fixo do site: estrelas + cortinas de aurora + brilho de horizonte */
export default function AuroraBackground() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Estrelas */}
      <div className="absolute inset-0 stars-layer opacity-70" />
      <div className="absolute inset-0 stars-layer-2" />

      {/* Cortinas de aurora — gradientes suaves, sem blur */}
      <div
        className="aurora-curtain w-[64vw] h-[95vh] top-[-30%] left-[-10%]"
        style={{
          background:
            'radial-gradient(ellipse 42% 52% at 50% 30%, rgba(99,247,141,0.34), rgba(53,224,101,0.1) 58%, transparent 76%)',
          ['--tilt' as string]: '-18deg',
          ['--speed' as string]: '26s',
          ['--glow' as string]: '0.9',
        }}
      />
      <div
        className="aurora-curtain w-[56vw] h-[90vh] top-[-32%] right-[-8%]"
        style={{
          background:
            'radial-gradient(ellipse 40% 50% at 50% 28%, rgba(75,238,198,0.3), rgba(31,211,167,0.09) 58%, transparent 76%)',
          ['--tilt' as string]: '14deg',
          ['--speed' as string]: '34s',
          ['--glow' as string]: '0.85',
          animationDirection: 'reverse',
        }}
      />
      <div
        className="aurora-curtain w-[44vw] h-[70vh] top-[-20%] left-[32%]"
        style={{
          background:
            'radial-gradient(ellipse 40% 48% at 50% 30%, rgba(143,252,176,0.24), rgba(99,247,141,0.07) 58%, transparent 76%)',
          ['--tilt' as string]: '-6deg',
          ['--speed' as string]: '42s',
          ['--glow' as string]: '0.8',
        }}
      />

      {/* Brilho da cidade no horizonte + vinheta de leitura */}
      <div className="absolute inset-x-0 bottom-0 h-[42vh] horizon-glow" />
      <div className="absolute inset-0 aurora-vignette" />
    </div>
  );
}
