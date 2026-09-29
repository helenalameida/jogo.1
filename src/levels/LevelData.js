/**
 * LevelData.js - Estrutura e Dados das 6 Fases do Jogo
 */

export const LEVELS = [
  // FASE 1: Sala de Estar
  {
    id: 1,
    name: 'Fase 1: Sala de Estar',
    subtitle: 'Um cômodo quentinho e acolhedor!',
    floorColor: 0xf5ebd7,
    wallColor: 0xffccbc,
    wallTrimColor: 0xffab91,
    parTime: 45,
    grid: [
      "###############",
      "#......S......#",
      "#.###.....###.#",
      "#.#.F..C..F.#.#",
      "#.#.###.###.#.#",
      "#.....V.....#.#",
      "#.###.....###.#",
      "#..1...L...G..#",
      "###############"
    ]
  },

  // FASE 2: Sala + Corredor (Corredor Desbloqueado e Porta Interativa D)
  {
    id: 2,
    name: 'Fase 2: Sala e Corredor',
    subtitle: 'Corredores conectam novos esconderijos e portas!',
    floorColor: 0xede7f6,
    wallColor: 0xd1c4e9,
    wallTrimColor: 0xb39ddb,
    parTime: 60,
    grid: [
      "###################",
      "#.....S.....#..F..#",
      "#.###...###.#.###.#",
      "#.#...C...#.D.#.1.#",
      "#.#.#####.#.#.#...#",
      "#...#...#.......#.#",
      "###.#.L.#.###.###.#",
      "#...#...#.......#.#",
      "#.###.#####.#.###.#",
      "#..2...V....#..Y..#",
      "###################"
    ]
  },

  // FASE 3: Cozinha
  {
    id: 3,
    name: 'Fase 3: Cozinha da Casa',
    subtitle: 'Piso quadriculado e bancadas de gostosuras!',
    floorColor: 0xe0f7fa,
    wallColor: 0xb2ebf2,
    wallTrimColor: 0x80deea,
    parTime: 75,
    grid: [
      "#####################",
      "#..K...R.....K...F..#",
      "#.###.#####.###.###.#",
      "#...#...C...#.....#.#",
      "#.###.#####.###.###.#",
      "#..1...M.....2....#.#",
      "#.###.#####.###.###.#",
      "#...#.......#...#.#.#",
      "#.###.#####.###.#.#.#",
      "#..F...L.....3..#..T#",
      "#####################"
    ]
  },

  // FASE 4: Quartos Aconchegantes
  {
    id: 4,
    name: 'Fase 4: Quartos e Gavetas',
    subtitle: 'Camas macias e caixas de papelão!',
    floorColor: 0xfce4ec,
    wallColor: 0xf8bbd0,
    wallTrimColor: 0xf48fb1,
    parTime: 90,
    grid: [
      "#######################",
      "#..B...#..P..#...B....#",
      "#.####.#.###.#.######.#",
      "#.#..1.#...#.#.#....#.#",
      "#.#.####.#.#.#.#.##.#.#",
      "#.#......#.C.#...#2.#.#",
      "#.#.####.#####.###..#.#",
      "#...#..O.....#...#..#.#",
      "#####.###.##.###.####.#",
      "#..3..#...#4...#...E..#",
      "#######################"
    ]
  },

  // FASE 5: Casa Inteira Conectada
  {
    id: 5,
    name: 'Fase 5: A Casa Inteira',
    subtitle: 'O grande labirinto de todos os cômodos!',
    floorColor: 0xfff8e1,
    wallColor: 0xffe082,
    wallTrimColor: 0xffca28,
    parTime: 120,
    grid: [
      "#########################",
      "#..S....#...B...#....K..#",
      "#.##.##.#.#####.#.##.##.#",
      "#.#...#.#.#.1.#.#.#...#.#",
      "#.#.G.#.#.#...#.#.#.M.#.#",
      "#.#...#...#...#...#...#.#",
      "#.###.#####.C.#####.###.#",
      "#...#...#.......#...#...#",
      "#.###.#####.V.#####.###.#",
      "#.#...#...#...#...#...#.#",
      "#.#.Y.#.#.#...#.#.#.E.#.#",
      "#.#...#.#.#.2.#.#.#...#.#",
      "#.##.##.#.#####.#.##.##.#",
      "#..3....#...4...#....T..#",
      "#########################"
    ]
  },

  // FASE 6: Casa + Quintal Florido (Grand Finale)
  {
    id: 6,
    name: 'Fase 6: Casa e Quintal Florido',
    subtitle: 'A grande festa com jardim ensolarado e flores!',
    floorColor: 0xe8f5e9, // Verde gramado suave no quintal
    wallColor: 0xa5d6a7,
    wallTrimColor: 0x81c784,
    parTime: 150,
    grid: [
      "###########################",
      "#..*....W...*...W....*....#",
      "#.##.##.W.#####.W.##.##.W.#",
      "#.#...#.W.#...#.W.#...#.W.#",
      "#.#.P.#.W.#.C.#.W.#.P.#.W.#",
      "#.#...#.W.#...#.W.#...#.W.#",
      "#...1...W...2...W...3...W.#",
      "#####W#####W#W#####W#####.#",
      "#...#...#.......#...#...#.#",
      "#.###.#####.S.#####.###.#.#",
      "#.#...#...#...#...#...#.#.#",
      "#.#.G.#.#.#.4.#.#.#.M.#.#.#",
      "#.#...#.#.#####.#.#...#.#.#",
      "#..T....#...O...#....*....#",
      "###########################"
    ]
  }
];
