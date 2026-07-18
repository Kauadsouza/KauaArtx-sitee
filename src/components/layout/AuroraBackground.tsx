// Céu fixo do site — expedição noturna: slate profundo, névoa fria no
// alto, brasa laranja no horizonte, montanhas distantes em silhueta e
// neve caindo devagar. (Substituiu a antiga aurora verde: é "a parte
// verde" que o dono pediu pra virar a pegada de aventura do print.)
export default function AuroraBackground() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base slate com leve profundidade (mais escuro em cima) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0b0f15 0%, #0d1117 44%, #10151d 100%)',
        }}
      />

      {/* Névoa fria e alta — como ar de montanha */}
      <div
        className="absolute inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            'radial-gradient(90% 70% at 50% -10%, rgba(120,150,190,0.10), transparent 70%)',
        }}
      />

      {/* Neve/brasas distantes caindo */}
      <div className="absolute inset-0 stars-layer opacity-70" />
      <div className="absolute inset-0 stars-layer-2" />

      {/* Montanhas distantes em silhueta, na base do céu */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh] opacity-[0.55]"
        style={{
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom center',
          backgroundSize: '1600px 100%',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 65%)',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 65%)',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='400' viewBox='0 0 1600 400'><path d='M0 400V230L120 250L240 180L360 235L480 150L600 220L760 120L900 210L1040 160L1180 235L1320 175L1460 245L1600 200V400Z' fill='%230a0e14'/><path d='M0 400V300L160 315L320 260L480 310L640 250L820 300L980 265L1160 315L1340 275L1520 320L1600 300V400Z' fill='%23070a0f'/></svg>\")",
        }}
      />

      {/* Brasa laranja no horizonte (pôr do sol atrás das cristas) */}
      <div className="absolute inset-x-0 bottom-0 h-[44vh] horizon-glow" />

      {/* Vinheta de leitura */}
      <div className="absolute inset-0 aurora-vignette" />
    </div>
  );
}
