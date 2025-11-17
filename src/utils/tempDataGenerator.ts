import { Node, Group, Edge, BlockEnum } from '@/types/graph/models';
import { useGraphStore } from '@/stores/graph';

// 临时数据生成器 - 根据多层嵌套群知识图谱案例展示.md中的mermaid图创建节点和群组
export const generateTestData = () => {
  const { addNode, addEdge, updateGroupBoundary } = useGraphStore.getState();
  
  // 为了便于布局，使用特定的坐标
  const positions = {
    // 宇宙层级 (顶层群组1)
    Universe: { x: 100, y: 100 },
    U0: { x: 150, y: 150 },
    Physical: { x: 300, y: 150 },
    P0: { x: 350, y: 200 },
    Quantum: { x: 500, y: 200 },
    Q1: { x: 550, y: 250 },
    Q2: { x: 550, y: 350 },
    Q3: { x: 550, y: 450 },
    Particles: { x: 700, y: 350 },
    Q2_1: { x: 750, y: 320 },
    Q2_2: { x: 750, y: 370 },
    Q2_3: { x: 750, y: 420 },
    Phenomena: { x: 700, y: 450 },
    Q3_1: { x: 750, y: 420 },
    Q3_2: { x: 750, y: 470 },
    Q3_3: { x: 750, y: 520 },
    Classical: { x: 500, y: 100 },
    C1: { x: 550, y: 100 },
    C2: { x: 550, y: 150 },
    C3: { x: 550, y: 200 },
    MetaPhysical: { x: 300, y: 350 },
    M0: { x: 350, y: 400 },
    Consciousness: { x: 500, y: 400 },
    Co1: { x: 550, y: 380 },
    Co2: { x: 550, y: 430 },
    Co3: { x: 550, y: 480 },
    Magic: { x: 500, y: 550 },
    Ma1: { x: 550, y: 530 },
    Ma2: { x: 550, y: 580 },
    Ma3: { x: 550, y: 630 },
    Energies: { x: 700, y: 580 },
    Ma2_1: { x: 750, y: 550 },
    Ma2_2: { x: 750, y: 600 },
    Ma2_3: { x: 750, y: 650 },

    // 世界层级 (顶层群组2)
    World: { x: 800, y: 100 },
    W0: { x: 850, y: 150 },
    Geography: { x: 1000, y: 150 },
    G0: { x: 1050, y: 200 },
    Continents: { x: 1200, y: 200 },
    Con1: { x: 1250, y: 170 },
    Con2: { x: 1250, y: 220 },
    Con3: { x: 1250, y: 270 },
    Resources: { x: 1200, y: 350 },
    Res1: { x: 1250, y: 320 },
    Res2: { x: 1250, y: 370 },
    Res3: { x: 1250, y: 420 },
    Civilizations: { x: 1000, y: 400 },
    Civ0: { x: 1050, y: 450 },
    Ancient: { x: 1200, y: 450 },
    Anc1: { x: 1250, y: 420 },
    Anc2: { x: 1250, y: 470 },
    Modern: { x: 1200, y: 550 },
    Mod1: { x: 1250, y: 520 },
    Mod2: { x: 1250, y: 570 },
    Social_Structure_Mod1: { x: 1400, y: 520 },
    Mod1_Soc1: { x: 1450, y: 490 },
    Mod1_Soc2: { x: 1450, y: 540 },
    Mod1_Soc3: { x: 1450, y: 590 },

    // 生命层级 (顶层群组3)
    Life: { x: 100, y: 600 },
    L0: { x: 150, y: 650 },
    Biological: { x: 300, y: 650 },
    B0: { x: 350, y: 700 },
    Cellular: { x: 500, y: 700 },
    Cel1: { x: 550, y: 670 },
    Cel2: { x: 550, y: 720 },
    Cel3: { x: 550, y: 770 },
    Organism: { x: 500, y: 850 },
    Org1: { x: 550, y: 820 },
    Org2: { x: 550, y: 870 },
    Org3: { x: 550, y: 920 },
    Races: { x: 700, y: 920 },
    Org3_1: { x: 750, y: 890 },
    Org3_2: { x: 750, y: 940 },
    Org3_3: { x: 750, y: 990 },
    Spiritual: { x: 300, y: 850 },
    Sp0: { x: 350, y: 900 },
    Emotional: { x: 500, y: 950 },
    Em1: { x: 550, y: 920 },
    Em2: { x: 550, y: 970 },
    Em3: { x: 550, y: 1020 },
    Mental: { x: 500, y: 1050 },
    Men1: { x: 550, y: 1020 },
    Men2: { x: 550, y: 1070 },
    Men3: { x: 550, y: 1120 },

    // 技术层级 (顶层群组4)
    Technology: { x: 800, y: 700 },
    T0: { x: 850, y: 750 },
    ClassicTech: { x: 1000, y: 750 },
    CT0: { x: 1050, y: 800 },
    Mechanical: { x: 1200, y: 800 },
    Mech1: { x: 1250, y: 770 },
    Mech2: { x: 1250, y: 820 },
    Mech3: { x: 1250, y: 870 },
    Chemical: { x: 1200, y: 900 },
    Chem1: { x: 1250, y: 870 },
    Chem2: { x: 1250, y: 920 },
    Chem3: { x: 1250, y: 970 },
    FutureTech: { x: 1000, y: 950 },
    FT0: { x: 1050, y: 1000 },
    Digital: { x: 1200, y: 1000 },
    Dig1: { x: 1250, y: 970 },
    Dig2: { x: 1250, y: 1020 },
    Dig3: { x: 1250, y: 1070 },
    AI_Core: { x: 1400, y: 1020 },
    Dig2_1: { x: 1450, y: 990 },
    Dig2_2: { x: 1450, y: 1040 },
    Dig2_3: { x: 1450, y: 1090 },
    BioTech: { x: 1200, y: 1100 },
    Bio1: { x: 1250, y: 1070 },
    Bio2: { x: 1250, y: 1120 },
    Bio3: { x: 1250, y: 1170 }
  };

  // 创建宇宙层级群组
  const universeGroup: Group = {
    id: 'Universe',
    type: BlockEnum.GROUP,
    title: '宇宙层级 (Universe Level)',
    position: positions.Universe,
    collapsed: false,
    nodeIds: ['U0', 'Physical', 'MetaPhysical'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 1000,
    height: 700,
  };

  const u0Node: Node = {
    id: 'U0',
    type: BlockEnum.NODE,
    title: '宇宙法则 (Universal Laws)',
    position: positions.U0,
    content: '宇宙的基本法则',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const physicalGroup: Group = {
    id: 'Physical',
    type: BlockEnum.GROUP,
    title: '物理宇宙 (Physical Universe)',
    position: positions.Physical,
    collapsed: false,
    nodeIds: ['P0', 'Quantum', 'Classical'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Universe',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 400,
  };

  const p0Node: Node = {
    id: 'P0',
    type: BlockEnum.NODE,
    title: '基础物理常数',
    position: positions.P0,
    content: '物理宇宙的基础常数',
    groupId: 'Physical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const quantumGroup: Group = {
    id: 'Quantum',
    type: BlockEnum.GROUP,
    title: '量子层面 (Quantum Level)',
    position: positions.Quantum,
    collapsed: false,
    nodeIds: ['Q1', 'Q2', 'Q3', 'Particles', 'Phenomena'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Physical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 400,
    height: 400,
  };

  const q1Node: Node = {
    id: 'Q1',
    type: BlockEnum.NODE,
    title: '量子场论',
    position: positions.Q1,
    content: '量子场论描述',
    groupId: 'Quantum',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const q2Node: Node = {
    id: 'Q2',
    type: BlockEnum.NODE,
    title: '基本粒子',
    position: positions.Q2,
    content: '基本粒子描述',
    groupId: 'Quantum',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const q3Node: Node = {
    id: 'Q3',
    type: BlockEnum.NODE,
    title: '量子现象',
    position: positions.Q3,
    content: '量子现象描述',
    groupId: 'Quantum',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const particlesGroup: Group = {
    id: 'Particles',
    type: BlockEnum.GROUP,
    title: '基本粒子 (Particles)',
    position: positions.Particles,
    collapsed: false,
    nodeIds: ['Q2_1', 'Q2_2', 'Q2_3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Quantum',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const q2_1Node: Node = {
    id: 'Q2_1',
    type: BlockEnum.NODE,
    title: '夸克 (Quark)',
    position: positions.Q2_1,
    content: '夸克描述',
    groupId: 'Particles',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const q2_2Node: Node = {
    id: 'Q2_2',
    type: BlockEnum.NODE,
    title: '轻子 (Lepton)',
    position: positions.Q2_2,
    content: '轻子描述',
    groupId: 'Particles',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const q2_3Node: Node = {
    id: 'Q2_3',
    type: BlockEnum.NODE,
    title: '玻色子 (Boson)',
    position: positions.Q2_3,
    content: '玻色子描述',
    groupId: 'Particles',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const phenomenaGroup: Group = {
    id: 'Phenomena',
    type: BlockEnum.GROUP,
    title: '量子现象 (Phenomena)',
    position: positions.Phenomena,
    collapsed: false,
    nodeIds: ['Q3_1', 'Q3_2', 'Q3_3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Quantum',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const q3_1Node: Node = {
    id: 'Q3_1',
    type: BlockEnum.NODE,
    title: '纠缠 (Entanglement)',
    position: positions.Q3_1,
    content: '量子纠缠现象',
    groupId: 'Phenomena',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const q3_2Node: Node = {
    id: 'Q3_2',
    type: BlockEnum.NODE,
    title: '叠加 (Superposition)',
    position: positions.Q3_2,
    content: '量子叠加现象',
    groupId: 'Phenomena',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const q3_3Node: Node = {
    id: 'Q3_3',
    type: BlockEnum.NODE,
    title: '隧穿 (Tunneling)',
    position: positions.Q3_3,
    content: '量子隧穿现象',
    groupId: 'Phenomena',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const classicalGroup: Group = {
    id: 'Classical',
    type: BlockEnum.GROUP,
    title: '经典物理 (Classical Physics)',
    position: positions.Classical,
    collapsed: false,
    nodeIds: ['C1', 'C2', 'C3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Physical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const c1Node: Node = {
    id: 'C1',
    type: BlockEnum.NODE,
    title: '牛顿力学',
    position: positions.C1,
    content: '牛顿力学描述',
    groupId: 'Classical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const c2Node: Node = {
    id: 'C2',
    type: BlockEnum.NODE,
    title: '麦克斯韦电磁学',
    position: positions.C2,
    content: '麦克斯韦电磁学描述',
    groupId: 'Classical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const c3Node: Node = {
    id: 'C3',
    type: BlockEnum.NODE,
    title: '相对论',
    position: positions.C3,
    content: '相对论描述',
    groupId: 'Classical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const metaphysicalGroup: Group = {
    id: 'MetaPhysical',
    type: BlockEnum.GROUP,
    title: '形而上学宇宙 (Metaphysical Universe)',
    position: positions.MetaPhysical,
    collapsed: false,
    nodeIds: ['M0', 'Consciousness', 'Magic'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Universe',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 400,
  };

  const m0Node: Node = {
    id: 'M0',
    type: BlockEnum.NODE,
    title: '存在与虚无',
    position: positions.M0,
    content: '形而上学基本概念',
    groupId: 'MetaPhysical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const consciousnessGroup: Group = {
    id: 'Consciousness',
    type: BlockEnum.GROUP,
    title: '意识层面 (Consciousness)',
    position: positions.Consciousness,
    collapsed: false,
    nodeIds: ['Co1', 'Co2', 'Co3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'MetaPhysical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const co1Node: Node = {
    id: 'Co1',
    type: BlockEnum.NODE,
    title: '个体意识',
    position: positions.Co1,
    content: '个体意识描述',
    groupId: 'Consciousness',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const co2Node: Node = {
    id: 'Co2',
    type: BlockEnum.NODE,
    title: '集体潜意识',
    position: positions.Co2,
    content: '集体潜意识描述',
    groupId: 'Consciousness',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const co3Node: Node = {
    id: 'Co3',
    type: BlockEnum.NODE,
    title: '源意识/阿卡西记录',
    position: positions.Co3,
    content: '源意识/阿卡西记录描述',
    groupId: 'Consciousness',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const magicGroup: Group = {
    id: 'Magic',
    type: BlockEnum.GROUP,
    title: '魔法层面 (Magic)',
    position: positions.Magic,
    collapsed: false,
    nodeIds: ['Ma1', 'Ma2', 'Ma3', 'Energies'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'MetaPhysical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 400,
    height: 300,
  };

  const ma1Node: Node = {
    id: 'Ma1',
    type: BlockEnum.NODE,
    title: '魔法源力',
    position: positions.Ma1,
    content: '魔法源力描述',
    groupId: 'Magic',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const ma2Node: Node = {
    id: 'Ma2',
    type: BlockEnum.NODE,
    title: '能量形态',
    position: positions.Ma2,
    content: '能量形态描述',
    groupId: 'Magic',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const ma3Node: Node = {
    id: 'Ma3',
    type: BlockEnum.NODE,
    title: '现实法则扭曲',
    position: positions.Ma3,
    content: '现实法则扭曲描述',
    groupId: 'Magic',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const energiesGroup: Group = {
    id: 'Energies',
    type: BlockEnum.GROUP,
    title: '能量形态 (Energy Forms)',
    position: positions.Energies,
    collapsed: false,
    nodeIds: ['Ma2_1', 'Ma2_2', 'Ma2_3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Magic',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const ma2_1Node: Node = {
    id: 'Ma2_1',
    type: BlockEnum.NODE,
    title: '元素能量 (Elemental)',
    position: positions.Ma2_1,
    content: '元素能量描述',
    groupId: 'Energies',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const ma2_2Node: Node = {
    id: 'Ma2_2',
    type: BlockEnum.NODE,
    title: '精神能量 (Mental)',
    position: positions.Ma2_2,
    content: '精神能量描述',
    groupId: 'Energies',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const ma2_3Node: Node = {
    id: 'Ma2_3',
    type: BlockEnum.NODE,
    title: '灵魂能量 (Spiritual)',
    position: positions.Ma2_3,
    content: '灵魂能量描述',
    groupId: 'Energies',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  // 创建世界层级群组
  const worldGroup: Group = {
    id: 'World',
    type: BlockEnum.GROUP,
    title: '世界层级 (World Level)',
    position: positions.World,
    collapsed: false,
    nodeIds: ['W0', 'Geography', 'Civilizations'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 1000,
    height: 700,
  };

  const w0Node: Node = {
    id: 'W0',
    type: BlockEnum.NODE,
    title: '世界之源/创世事件',
    position: positions.W0,
    content: '世界的起源事件',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const geographyGroup: Group = {
    id: 'Geography',
    type: BlockEnum.GROUP,
    title: '地理环境 (Geography)',
    position: positions.Geography,
    collapsed: false,
    nodeIds: ['G0', 'Continents', 'Resources'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'World',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 400,
  };

  const g0Node: Node = {
    id: 'G0',
    type: BlockEnum.NODE,
    title: '星球物理参数',
    position: positions.G0,
    content: '星球的物理参数',
    groupId: 'Geography',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const continentsGroup: Group = {
    id: 'Continents',
    type: BlockEnum.GROUP,
    title: '大陆系统 (Continents)',
    position: positions.Continents,
    collapsed: false,
    nodeIds: ['Con1', 'Con2', 'Con3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Geography',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const con1Node: Node = {
    id: 'Con1',
    type: BlockEnum.NODE,
    title: '火山大陆-伊格尼斯',
    position: positions.Con1,
    content: '火山大陆的描述',
    groupId: 'Continents',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const con2Node: Node = {
    id: 'Con2',
    type: BlockEnum.NODE,
    title: '浮空群岛-埃忒尔',
    position: positions.Con2,
    content: '浮空群岛的描述',
    groupId: 'Continents',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const con3Node: Node = {
    id: 'Con3',
    type: BlockEnum.NODE,
    title: '水晶森林-希尔瓦',
    position: positions.Con3,
    content: '水晶森林的描述',
    groupId: 'Continents',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const resourcesGroup: Group = {
    id: 'Resources',
    type: BlockEnum.GROUP,
    title: '资源系统 (Resources)',
    position: positions.Resources,
    collapsed: false,
    nodeIds: ['Res1', 'Res2', 'Res3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Geography',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const res1Node: Node = {
    id: 'Res1',
    type: BlockEnum.NODE,
    title: '稀有矿物',
    position: positions.Res1,
    content: '稀有矿物描述',
    groupId: 'Resources',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const res2Node: Node = {
    id: 'Res2',
    type: BlockEnum.NODE,
    title: '特有生物群',
    position: positions.Res2,
    content: '特有生物群描述',
    groupId: 'Resources',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const res3Node: Node = {
    id: 'Res3',
    type: BlockEnum.NODE,
    title: '魔力节点/地脉',
    position: positions.Res3,
    content: '魔力节点/地脉描述',
    groupId: 'Resources',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const civilizationsGroup: Group = {
    id: 'Civilizations',
    type: BlockEnum.GROUP,
    title: '文明系统 (Civilizations)',
    position: positions.Civilizations,
    collapsed: false,
    nodeIds: ['Civ0', 'Ancient', 'Modern'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'World',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 400,
  };

  const civ0Node: Node = {
    id: 'Civ0',
    type: BlockEnum.NODE,
    title: '文明演化法则',
    position: positions.Civ0,
    content: '文明演化的基本法则',
    groupId: 'Civilizations',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const ancientGroup: Group = {
    id: 'Ancient',
    type: BlockEnum.GROUP,
    title: '失落文明 (Ancient)',
    position: positions.Ancient,
    collapsed: false,
    nodeIds: ['Anc1', 'Anc2'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Civilizations',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const anc1Node: Node = {
    id: 'Anc1',
    type: BlockEnum.NODE,
    title: '前代科技文明',
    position: positions.Anc1,
    content: '前代科技文明描述',
    groupId: 'Ancient',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const anc2Node: Node = {
    id: 'Anc2',
    type: BlockEnum.NODE,
    title: '古代魔法帝国',
    position: positions.Anc2,
    content: '古代魔法帝国描述',
    groupId: 'Ancient',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const modernGroup: Group = {
    id: 'Modern',
    type: BlockEnum.GROUP,
    title: '现代文明 (Modern)',
    position: positions.Modern,
    collapsed: false,
    nodeIds: ['Mod1', 'Mod2', 'Social_Structure_Mod1'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Civilizations',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 300,
  };

  const mod1Node: Node = {
    id: 'Mod1',
    type: BlockEnum.NODE,
    title: '联邦-泰拉',
    position: positions.Mod1,
    content: '联邦-泰拉的描述',
    groupId: 'Modern',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const mod2Node: Node = {
    id: 'Mod2',
    type: BlockEnum.NODE,
    title: '帝国-凯撒利亚',
    position: positions.Mod2,
    content: '帝国-凯撒利亚的描述',
    groupId: 'Modern',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const socialStructureMod1Group: Group = {
    id: 'Social_Structure_Mod1',
    type: BlockEnum.GROUP,
    title: '泰拉联邦社会结构',
    position: positions.Social_Structure_Mod1,
    collapsed: false,
    nodeIds: ['Mod1_Soc1', 'Mod1_Soc2', 'Mod1_Soc3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Modern',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const mod1Soc1Node: Node = {
    id: 'Mod1_Soc1',
    type: BlockEnum.NODE,
    title: '民主政体',
    position: positions.Mod1_Soc1,
    content: '民主政体描述',
    groupId: 'Social_Structure_Mod1',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const mod1Soc2Node: Node = {
    id: 'Mod1_Soc2',
    type: BlockEnum.NODE,
    title: '市场经济',
    position: positions.Mod1_Soc2,
    content: '市场经济描述',
    groupId: 'Social_Structure_Mod1',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const mod1Soc3Node: Node = {
    id: 'Mod1_Soc3',
    type: BlockEnum.NODE,
    title: '科技至上文化',
    position: positions.Mod1_Soc3,
    content: '科技至上文化描述',
    groupId: 'Social_Structure_Mod1',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  // 创建生命层级群组
  const lifeGroup: Group = {
    id: 'Life',
    type: BlockEnum.GROUP,
    title: '生命层级 (Life Level)',
    position: positions.Life,
    collapsed: false,
    nodeIds: ['L0', 'Biological', 'Spiritual'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 1000,
    height: 700,
  };

  const l0Node: Node = {
    id: 'L0',
    type: BlockEnum.NODE,
    title: '生命起源/神创/演化',
    position: positions.L0,
    content: '生命起源描述',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const biologicalGroup: Group = {
    id: 'Biological',
    type: BlockEnum.GROUP,
    title: '生物层面 (Biological)',
    position: positions.Biological,
    collapsed: false,
    nodeIds: ['B0', 'Cellular', 'Organism'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Life',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 400,
  };

  const b0Node: Node = {
    id: 'B0',
    type: BlockEnum.NODE,
    title: '遗传与变异',
    position: positions.B0,
    content: '遗传与变异描述',
    groupId: 'Biological',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const cellularGroup: Group = {
    id: 'Cellular',
    type: BlockEnum.GROUP,
    title: '细胞层面 (Cellular)',
    position: positions.Cellular,
    collapsed: false,
    nodeIds: ['Cel1', 'Cel2', 'Cel3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Biological',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const cel1Node: Node = {
    id: 'Cel1',
    type: BlockEnum.NODE,
    title: '细胞器功能',
    position: positions.Cel1,
    content: '细胞器功能描述',
    groupId: 'Cellular',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const cel2Node: Node = {
    id: 'Cel2',
    type: BlockEnum.NODE,
    title: '能量代谢(ATP)',
    position: positions.Cel2,
    content: '能量代谢(ATP)描述',
    groupId: 'Cellular',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const cel3Node: Node = {
    id: 'Cel3',
    type: BlockEnum.NODE,
    title: '基因表达',
    position: positions.Cel3,
    content: '基因表达描述',
    groupId: 'Cellular',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const organismGroup: Group = {
    id: 'Organism',
    type: BlockEnum.GROUP,
    title: '有机体层面 (Organism)',
    position: positions.Organism,
    collapsed: false,
    nodeIds: ['Org1', 'Org2', 'Org3', 'Races'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Biological',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 400,
    height: 300,
  };

  const org1Node: Node = {
    id: 'Org1',
    type: BlockEnum.NODE,
    title: '能量基生命',
    position: positions.Org1,
    content: '能量基生命描述',
    groupId: 'Organism',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const org2Node: Node = {
    id: 'Org2',
    type: BlockEnum.NODE,
    title: '碳基生命',
    position: positions.Org2,
    content: '碳基生命描述',
    groupId: 'Organism',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const org3Node: Node = {
    id: 'Org3',
    type: BlockEnum.NODE,
    title: '智慧种族',
    position: positions.Org3,
    content: '智慧种族描述',
    groupId: 'Organism',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const racesGroup: Group = {
    id: 'Races',
    type: BlockEnum.GROUP,
    title: '智慧种族 (Races)',
    position: positions.Races,
    collapsed: false,
    nodeIds: ['Org3_1', 'Org3_2', 'Org3_3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Organism',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const org3_1Node: Node = {
    id: 'Org3_1',
    type: BlockEnum.NODE,
    title: '人类 (Human)',
    position: positions.Org3_1,
    content: '人类的描述',
    groupId: 'Races',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const org3_2Node: Node = {
    id: 'Org3_2',
    type: BlockEnum.NODE,
    title: '精灵 (Elf)',
    position: positions.Org3_2,
    content: '精灵的描述',
    groupId: 'Races',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const org3_3Node: Node = {
    id: 'Org3_3',
    type: BlockEnum.NODE,
    title: '龙族 (Dragon)',
    position: positions.Org3_3,
    content: '龙族的描述',
    groupId: 'Races',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const spiritualGroup: Group = {
    id: 'Spiritual',
    type: BlockEnum.GROUP,
    title: '精神层面 (Spiritual)',
    position: positions.Spiritual,
    collapsed: false,
    nodeIds: ['Sp0', 'Emotional', 'Mental'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Life',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 400,
  };

  const sp0Node: Node = {
    id: 'Sp0',
    type: BlockEnum.NODE,
    title: '灵魂本质',
    position: positions.Sp0,
    content: '灵魂本质描述',
    groupId: 'Spiritual',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const emotionalGroup: Group = {
    id: 'Emotional',
    type: BlockEnum.GROUP,
    title: '情感层面 (Emotional)',
    position: positions.Emotional,
    collapsed: false,
    nodeIds: ['Em1', 'Em2', 'Em3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Spiritual',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const em1Node: Node = {
    id: 'Em1',
    type: BlockEnum.NODE,
    title: '基础情绪',
    position: positions.Em1,
    content: '基础情绪描述',
    groupId: 'Emotional',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const em2Node: Node = {
    id: 'Em2',
    type: BlockEnum.NODE,
    title: '社会性情感',
    position: positions.Em2,
    content: '社会性情感描述',
    groupId: 'Emotional',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const em3Node: Node = {
    id: 'Em3',
    type: BlockEnum.NODE,
    title: '法则级情感(爱/恨)',
    position: positions.Em3,
    content: '法则级情感描述',
    groupId: 'Emotional',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const mentalGroup: Group = {
    id: 'Mental',
    type: BlockEnum.GROUP,
    title: '心智层面 (Mental)',
    position: positions.Mental,
    collapsed: false,
    nodeIds: ['Men1', 'Men2', 'Men3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Spiritual',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const men1Node: Node = {
    id: 'Men1',
    type: BlockEnum.NODE,
    title: '逻辑推理',
    position: positions.Men1,
    content: '逻辑推理描述',
    groupId: 'Mental',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const men2Node: Node = {
    id: 'Men2',
    type: BlockEnum.NODE,
    title: '记忆模型',
    position: positions.Men2,
    content: '记忆模型描述',
    groupId: 'Mental',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const men3Node: Node = {
    id: 'Men3',
    type: BlockEnum.NODE,
    title: '创造性直觉',
    position: positions.Men3,
    content: '创造性直觉描述',
    groupId: 'Mental',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  // 创建技术层级群组
  const technologyGroup: Group = {
    id: 'Technology',
    type: BlockEnum.GROUP,
    title: '技术层级 (Technology Level)',
    position: positions.Technology,
    collapsed: false,
    nodeIds: ['T0', 'ClassicTech', 'FutureTech'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 1000,
    height: 700,
  };

  const t0Node: Node = {
    id: 'T0',
    type: BlockEnum.NODE,
    title: '技术奇点',
    position: positions.T0,
    content: '技术奇点描述',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const classicTechGroup: Group = {
    id: 'ClassicTech',
    type: BlockEnum.GROUP,
    title: '古典技术 (Classic Technology)',
    position: positions.ClassicTech,
    collapsed: false,
    nodeIds: ['CT0', 'Mechanical', 'Chemical'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Technology',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 400,
  };

  const ct0Node: Node = {
    id: 'CT0',
    type: BlockEnum.NODE,
    title: '炼金术与工程学',
    position: positions.CT0,
    content: '炼金术与工程学描述',
    groupId: 'ClassicTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const mechanicalGroup: Group = {
    id: 'Mechanical',
    type: BlockEnum.GROUP,
    title: '机械技术 (Mechanical)',
    position: positions.Mechanical,
    collapsed: false,
    nodeIds: ['Mech1', 'Mech2', 'Mech3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'ClassicTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const mech1Node: Node = {
    id: 'Mech1',
    type: BlockEnum.NODE,
    title: '齿轮与杠杆',
    position: positions.Mech1,
    content: '齿轮与杠杆描述',
    groupId: 'Mechanical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const mech2Node: Node = {
    id: 'Mech2',
    type: BlockEnum.NODE,
    title: '蒸汽核心',
    position: positions.Mech2,
    content: '蒸汽核心描述',
    groupId: 'Mechanical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const mech3Node: Node = {
    id: 'Mech3',
    type: BlockEnum.NODE,
    title: '精密魔导机械',
    position: positions.Mech3,
    content: '精密魔导机械描述',
    groupId: 'Mechanical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const chemicalGroup: Group = {
    id: 'Chemical',
    type: BlockEnum.GROUP,
    title: '化学技术 (Chemical)',
    position: positions.Chemical,
    collapsed: false,
    nodeIds: ['Chem1', 'Chem2', 'Chem3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'ClassicTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const chem1Node: Node = {
    id: 'Chem1',
    type: BlockEnum.NODE,
    title: '药剂学',
    position: positions.Chem1,
    content: '药剂学描述',
    groupId: 'Chemical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const chem2Node: Node = {
    id: 'Chem2',
    type: BlockEnum.NODE,
    title: '火药与爆炸物',
    position: positions.Chem2,
    content: '火药与爆炸物描述',
    groupId: 'Chemical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const chem3Node: Node = {
    id: 'Chem3',
    type: BlockEnum.NODE,
    title: '材料合成',
    position: positions.Chem3,
    content: '材料合成描述',
    groupId: 'Chemical',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const futureTechGroup: Group = {
    id: 'FutureTech',
    type: BlockEnum.GROUP,
    title: '未来技术 (Future Technology)',
    position: positions.FutureTech,
    collapsed: false,
    nodeIds: ['FT0', 'Digital', 'BioTech'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Technology',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 400,
  };

  const ft0Node: Node = {
    id: 'FT0',
    type: BlockEnum.NODE,
    title: '超理论物理应用',
    position: positions.FT0,
    content: '超理论物理应用描述',
    groupId: 'FutureTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 120,
  };

  const digitalGroup: Group = {
    id: 'Digital',
    type: BlockEnum.GROUP,
    title: '数字技术 (Digital)',
    position: positions.Digital,
    collapsed: false,
    nodeIds: ['Dig1', 'Dig2', 'Dig3', 'AI_Core'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'FutureTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 500,
    height: 300,
  };

  const dig1Node: Node = {
    id: 'Dig1',
    type: BlockEnum.NODE,
    title: '量子计算',
    position: positions.Dig1,
    content: '量子计算描述',
    groupId: 'Digital',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const dig2Node: Node = {
    id: 'Dig2',
    type: BlockEnum.NODE,
    title: '强人工智能(AGI)',
    position: positions.Dig2,
    content: '强人工智能(AGI)描述',
    groupId: 'Digital',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const dig3Node: Node = {
    id: 'Dig3',
    type: BlockEnum.NODE,
    title: '沉浸式虚拟现实',
    position: positions.Dig3,
    content: '沉浸式虚拟现实描述',
    groupId: 'Digital',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const aiCoreGroup: Group = {
    id: 'AI_Core',
    type: BlockEnum.GROUP,
    title: 'AGI核心',
    position: positions.AI_Core,
    collapsed: false,
    nodeIds: ['Dig2_1', 'Dig2_2', 'Dig2_3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'Digital',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const dig2_1Node: Node = {
    id: 'Dig2_1',
    type: BlockEnum.NODE,
    title: '机器学习',
    position: positions.Dig2_1,
    content: '机器学习描述',
    groupId: 'AI_Core',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const dig2_2Node: Node = {
    id: 'Dig2_2',
    type: BlockEnum.NODE,
    title: '深度神经网络',
    position: positions.Dig2_2,
    content: '深度神经网络描述',
    groupId: 'AI_Core',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const dig2_3Node: Node = {
    id: 'Dig2_3',
    type: BlockEnum.NODE,
    title: '自主意识算法',
    position: positions.Dig2_3,
    content: '自主意识算法描述',
    groupId: 'AI_Core',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const bioTechGroup: Group = {
    id: 'BioTech',
    type: BlockEnum.GROUP,
    title: '生物技术 (Biotechnology)',
    position: positions.BioTech,
    collapsed: false,
    nodeIds: ['Bio1', 'Bio2', 'Bio3'],
    boundary: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    groupId: 'FutureTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 300,
    height: 200,
  };

  const bio1Node: Node = {
    id: 'Bio1',
    type: BlockEnum.NODE,
    title: '基因编辑(CRISPR)',
    position: positions.Bio1,
    content: '基因编辑(CRISPR)描述',
    groupId: 'BioTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const bio2Node: Node = {
    id: 'Bio2',
    type: BlockEnum.NODE,
    title: '合成生物学',
    position: positions.Bio2,
    content: '合成生物学描述',
    groupId: 'BioTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  const bio3Node: Node = {
    id: 'Bio3',
    type: BlockEnum.NODE,
    title: '意识数字化上传',
    position: positions.Bio3,
    content: '意识数字化上传描述',
    groupId: 'BioTech',
    createdAt: new Date(),
    updatedAt: new Date(),
    width: 250,
    height: 120,
  };

  // 将所有节点和群组添加到store
  const nodes = [
    // 宇宙层级
    universeGroup,
    u0Node,
    physicalGroup,
    p0Node,
    quantumGroup,
    q1Node,
    q2Node,
    q3Node,
    particlesGroup,
    q2_1Node,
    q2_2Node,
    q2_3Node,
    phenomenaGroup,
    q3_1Node,
    q3_2Node,
    q3_3Node,
    classicalGroup,
    c1Node,
    c2Node,
    c3Node,
    metaphysicalGroup,
    m0Node,
    consciousnessGroup,
    co1Node,
    co2Node,
    co3Node,
    magicGroup,
    ma1Node,
    ma2Node,
    ma3Node,
    energiesGroup,
    ma2_1Node,
    ma2_2Node,
    ma2_3Node,
    
    // 世界层级
    worldGroup,
    w0Node,
    geographyGroup,
    g0Node,
    continentsGroup,
    con1Node,
    con2Node,
    con3Node,
    resourcesGroup,
    res1Node,
    res2Node,
    res3Node,
    civilizationsGroup,
    civ0Node,
    ancientGroup,
    anc1Node,
    anc2Node,
    modernGroup,
    mod1Node,
    mod2Node,
    socialStructureMod1Group,
    mod1Soc1Node,
    mod1Soc2Node,
    mod1Soc3Node,
    
    // 生命层级
    lifeGroup,
    l0Node,
    biologicalGroup,
    b0Node,
    cellularGroup,
    cel1Node,
    cel2Node,
    cel3Node,
    organismGroup,
    org1Node,
    org2Node,
    org3Node,
    racesGroup,
    org3_1Node,
    org3_2Node,
    org3_3Node,
    spiritualGroup,
    sp0Node,
    emotionalGroup,
    em1Node,
    em2Node,
    em3Node,
    mentalGroup,
    men1Node,
    men2Node,
    men3Node,
    
    // 技术层级
    technologyGroup,
    t0Node,
    classicTechGroup,
    ct0Node,
    mechanicalGroup,
    mech1Node,
    mech2Node,
    mech3Node,
    chemicalGroup,
    chem1Node,
    chem2Node,
    chem3Node,
    futureTechGroup,
    ft0Node,
    digitalGroup,
    dig1Node,
    dig2Node,
    dig3Node,
    aiCoreGroup,
    dig2_1Node,
    dig2_2Node,
    dig2_3Node,
    bioTechGroup,
    bio1Node,
    bio2Node,
    bio3Node
  ];

  // 添加所有节点和群组到store
  nodes.forEach(node => {
    // 对于群组类型，使用addGroup
    if (node.type === BlockEnum.GROUP) {
      (addNode as any)(node as Group);
    } else {
      addNode(node);
    }
  });

  // 更新所有群组的边界
  nodes.forEach(node => {
    if (node.type === BlockEnum.GROUP) {
      updateGroupBoundary(node.id);
    }
  });

  // 创建跨群组关系
  const edges: Edge[] = [
    // 顶层群组关系
    { source: 'U0', target: 'W0', id: 'U0_W0_1', label: '定义', createdAt: new Date(), updatedAt: new Date() },
    { source: 'U0', target: 'L0', id: 'U0_L0_1', label: '涌现出', createdAt: new Date(), updatedAt: new Date() },
    { source: 'U0', target: 'T0', id: 'U0_T0_1', label: '设定上限', createdAt: new Date(), updatedAt: new Date() },
    { source: 'W0', target: 'L0', id: 'W0_L0_1', label: '承载', createdAt: new Date(), updatedAt: new Date() },
    { source: 'W0', target: 'T0', id: 'W0_T0_1', label: '提供物质基础', createdAt: new Date(), updatedAt: new Date() },
    { source: 'L0', target: 'T0', id: 'L0_T0_1', label: '发展出', createdAt: new Date(), updatedAt: new Date() },
    { source: 'T0', target: 'U0', id: 'T0_U0_1', label: '验证/改写', createdAt: new Date(), updatedAt: new Date() },
    { source: 'T0', target: 'W0', id: 'T0_W0_1', label: '重塑', createdAt: new Date(), updatedAt: new Date() },
    { source: 'T0', target: 'L0', id: 'T0_L0_1', label: '进化/增强', createdAt: new Date(), updatedAt: new Date() },

    // 更具体的跨群组关系
    { source: 'Q3_1', target: 'Dig1', id: 'Q3_1_Dig1_1', label: '是...的理论基础', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Ma1', target: 'Mech3', id: 'Ma1_Mech3_1', label: '被...利用', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Res3', target: 'Ma1', id: 'Res3_Ma1_1', label: '是...的能量来源', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Con1', target: 'Res1', id: 'Con1_Res1_1', label: '提供', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Anc1', target: 'FutureTech', id: 'Anc1_FutureTech_1', label: '遗留技术启发', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Mod1_Soc3', target: 'Digital', id: 'Mod1_Soc3_Digital_1', label: '推动', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Cel3', target: 'Bio1', id: 'Cel3_Bio1_1', label: '是...的研究对象', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Sp0', target: 'Bio3', id: 'Sp0_Bio3_1', label: '是...的目标', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Men3', target: 'Dig2_3', id: 'Men3_Dig2_3_1', label: '驱动', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Dig2_2', target: 'Men2', id: 'Dig2_2_Men2_1', label: '模拟', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Bio3', target: 'Co3', id: 'Bio3_Co3_1', label: '实现', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Org3_2', target: 'Ma2_1', id: 'Org3_2_Ma2_1_1', label: '擅长', createdAt: new Date(), updatedAt: new Date() },
    { source: 'Em3', target: 'Ma2_3', id: 'Em3_Ma2_3_1', label: '可作为能量源', createdAt: new Date(), updatedAt: new Date() }
  ];

  // 添加所有边
  edges.forEach(edge => {
    addEdge(edge);
  });

  console.log('✅ 临时数据生成完成，已添加', nodes.length, '个节点/群组和', edges.length, '条边');
};

export default generateTestData;