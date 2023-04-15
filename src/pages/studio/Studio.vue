<template>
  <AppSection id="studio">
    <h2>Studio Setup</h2>

    <a :href="picture" target="_blank">
      <img :src="picture" alt="picture of vince's studio" loading="lazy" />
    </a>

    <div class="grid">
      <div v-for="(list, name, index) in setup" :key="index">
        <h3>{{ name }}</h3>
        <ul class="list">
          <li v-for="(item, index) in list" :key="index" class="item">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </AppSection>
</template>

<script setup lang="ts">
import picture from "@/assets/studio.jpg";

const setup: { [key: string]: string[] } = {
  "🖥️ Machine": [
    "Windows 10 Pro 64bit",
    "AMD Ryzen 9 3900X",
    "32 gb ram",
    '(2) 24" 144 Hz LED monitors',
    "(1) 1 tb 970 EVO for OS",
    "(1) 1 tb 970 EVO for samples",
    "(1) 512 gb SSD for EWQL libraries",
    "RX 480 gpu",
    "2 tb external storage, backed up remotely",
  ],
  "🎙️ Equipment": [
    "(2) Yamaha HS80M monitors",
    "Audio-Technica ATH-M50x headphones",
    "M-Audio Oxygen 49 midi keyboard",
    "Focusrite Scarlett 18i8 interface",
    "Rode NT-USB mic (for vocals)",
    "Behringer B1 mic (general purpose)",
    "Audio-Technica AT2020 mic (general purpose)",
    "Sennheiser e906 mic (for guitars)",
    "Zoom H2 handheld recorder (for portable foley)",
  ],
  "🎸 Instruments": [
    "Acoustic Drum Set - double pedal kick, snare, hats, (3) toms, (2) crash, ride, china, splash, roto-toms",
    "Yamaha DGX-640 piano, melodica",
    "Tin whistle, wood flutes",
    "Bongos, shakers, log drum, vibraslap",
    "... and various other auxiliary percussion and trinkets",
  ],
  "🤖 Software": [
    "Imageline FL Studio Producer Edition",
    "MuseScore for notation",
    "Audacity, Wavosaur, various other utilities",
    "Custom audio batch processing scripts",
    "... and various other utilities",
  ],
  "🔌 Plugins": [
    "NI Komplete 12 (Massive, Massive X, FM8, Absynth, Reaktor, Guitar Rig, etc.)",
    "Spectrasonics Omnisphere",
    "u-He Zebra 2",
    "reFX Nexus, Vanguard",
    "LennarDigital Sylenth1",
    "Camel Audio Alchemy, CamelPhat",
    "Cakewalk Z3ta",
    "QuikQuak Glass Viper",
    "Audio Modeling SWAM Saxophones",
    "Sonic Charge Synplant",
    "IK Multimedia Modo Bass",
    "GForce impOSCar2",
    "Ample Sounds stuff",
    "Korg Legacy Collection",
    "Emagic Vintage Piano 73, Crystal Soft Synth, AudioRealism Bass Line 2, and other freebies",
    "... and various other plugins",
  ],
  "📚 Sample Libraries": [
    "NI Komplete 12 (Factory Library, Battery, etc.)",
    "EWQL Hollywood Strings, Hollywood Brass, Hollywood Choirs, RA, Ministry of Rock, Storm Drum 2, Pianos, Symphonic Orchestra, Symphonic Choirs",
    "Spitfire Albion One, Albion, Chamber Strings, Sable Strings, Percussion, Labs, Hg2O",
    "Audiobro LA Scoring Strings",
    "Fluffy Audio Dominus Choir Pro",
    "Cinesamples CineBrass Pro, Piano in Blue, CineHarp",
    "Sample Modeling Trumpet, Trombone, Horn, Tuba",
    "VSL SE Woodwinds, SE Percussion",
    "Impact Soundworks Shreddage 1/2/3, Pearl, Juggernaut, Bravura, Rhapsody Orchestral Percussion, Vocalisa",
    "ProjectSAM True Strike",
    "Fable Sounds Broadway Big Band Lites",
    "Mixosaurus Drums, GetGood Drums Matt Halpern, Steven Slate Drums, Superior Drummer 2",
    "Orange Tree Samples Strawberry, Stratosphere, Cherry, Rick, Steel",
    "Handheld Sound Scoring Mallets, Flying Percussion",
    "FT Samples Timpani on Fire",
    "Embertone Joshua Bell Violin, Friedlander, Blakus, Shan Bawu",
    "Felt Instruments Lekko, Jasno",
    "Heavyocity Ethnic Drum Ensembles",
    "Nine Volt Audio Taiko, Taiko 2",
    "eLab Smoker's Delight",
    "Best Service Blue Box, Drums Overkill, Emotional Cello",
    "Electronisounds Vinyl Revolution",
    "Hollywood Edge Foley Sound Library",
    "Loopmasters stuff",
    "Cinematique stuff",
    "PettinHouse stuff",
    "Waves Factory stuff",
    "Garritan Personal Orchestra, Jazz & Big Band",
    "Tapspace Virtual Drumline 2",
    "Big Cat Instruments, Ivy Audio, and other freebies",
    "... and various other libraries, samples, and soundfonts",
  ],
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.list {
  list-style: none;
  padding: 0;
  line-height: 1.5em;
}

.item {
  margin: 10px 0;
}

@media (max-width: 800px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
