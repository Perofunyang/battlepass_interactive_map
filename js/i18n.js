const I18N = {
    ko: {
        title: "배틀 패스 문서 인터랙티브 맵",
        subtitle: "Battle Pass Documentation Map",
        langBtnText: "🌐 EN",
        langBtnTarget: "./en.html",
        categoriesHeader: "문서 종류 / Categories",
        raidSpawnsTitle: "🎲 스폰 정보 (Raid Spawns)",
        coordText: (y, x) => `Y: ${y}, X: ${x} (Click to Copy / 클릭시 복사)`,
        copiedText: (coord) => `복사됨! -> ${coord}`,
        showDetailDesc: true, // 한국어 페이지: 상세 설명문 출력
        mapNames: {
            customs: "Customs (세관)",
            ground_zero: "Ground Zero (그라운드 제로)",
            factory: "Factory (공장)",
            icebreaker: "Icebreaker (쇄빙선)",
            interchange: "Interchange (인터체인지)",
            lab: "The Lab (연구실)",
            labyrinth: "The Labyrinth (미궁)",
            lighthouse: "Lighthouse (등대)",
            reserve: "Reserve (리저브)",
            shoreline: "Shoreline (해안선)",
            streets_of_tarkov: "Streets of Tarkov (스오타)",
            woods: "Woods (삼림)"
        },
        categories: {
            technical: { name: "Technical", icon: "./assets/icons/technical.webp", image: "./assets/category/technical.webp", desc: "shoreline(쇼라)\n woods(우드)\n lighthouse(라하)" },
            pmc: { name: "PMC", icon: "./assets/icons/pmc.webp", image: "./assets/category/pmc.webp", desc: "reserve(리저브)\n icebreaker(쇄빙선)\n lighthouse(라하)" },
            project: { name: "Project", icon: "./assets/icons/project.webp", image: "./assets/category/project.webp", desc: "reserve(리저브)\n customs(세관)\n factory(공장)" },
            blueprints: { name: "Blueprints", icon: "./assets/icons/blueprints.webp", image: "./assets/category/blueprints.webp", desc: "interchange(인터체인지)\n factory(공장)\n The Labyrinth(미궁)" },
            test: { name: "Test", icon: "./assets/icons/test.webp", image: "./assets/category/test.webp", desc: "shoreline(쇼라)\n woods(우드)\n icebreaker(쇄빙선)" },
            user: { name: "User", icon: "./assets/icons/user.webp", image: "./assets/category/user.webp", desc: "Streets of Tarkov(스오타)\n Ground Zero(그제)\n The Lab(랩)" },
            medical: { name: "Medical", icon: "./assets/icons/medical.webp", image: "./assets/category/medical.webp", desc: "The Labyrinth(미궁)\n Ground Zero(그제)\n The Lab(랩)" },
            financial: { name: "Financial", icon: "./assets/icons/financial.webp", image: "./assets/category/financial.webp", desc: "customs(세관)\n Streets of Tarkov(스오타)\n interchange(인터체인지)" },
            transit: { name: "Transit", icon: "./assets/icons/transit.webp", image: "./assets/category/transit.webp", desc: "트랜짓(Transit) 포인트" },
            temporary: { name: "Temporary", icon: "./assets/icons/temporary.png", desc: "임시 마커" }
        },
        copyright: "© 2026 EFT BP Map.<br>본 사이트는 팬 제작 지도이며, 게임 관련 자산의 모든 권리는 Battlestate Games에 있습니다."
    },
    en: {
        title: "Battle Pass Doc Map",
        subtitle: "Escape From Tarkov",
        langBtnText: "🌐 KO",
        langBtnTarget: "./index.html",
        categoriesHeader: "Categories",
        raidSpawnsTitle: "🎲 Raid Spawns",
        coordText: (y, x) => `Y: ${y}, X: ${x} (Click to Copy)`,
        copiedText: (coord) => `Copied! -> ${coord}`,
        showDetailDesc: false, // 영문 페이지: 한국어 상세 설명문 생략
        mapNames: {
            customs: "Customs",
            ground_zero: "Ground Zero",
            factory: "Factory",
            icebreaker: "Icebreaker",
            interchange: "Interchange",
            lab: "The Lab",
            labyrinth: "The Labyrinth",
            lighthouse: "Lighthouse",
            reserve: "Reserve",
            shoreline: "Shoreline",
            streets_of_tarkov: "Streets of Tarkov",
            woods: "Woods"
        },
        categories: {
            technical: { name: "Technical", icon: "./assets/icons/technical.webp", image: "./assets/category/technical.webp", desc: "Shoreline\n Woods\n Lighthouse" },
            pmc: { name: "PMC", icon: "./assets/icons/pmc.webp", image: "./assets/category/pmc.webp", desc: "Reserve\n Icebreaker\n Lighthouse" },
            project: { name: "Project", icon: "./assets/icons/project.webp", image: "./assets/category/project.webp", desc: "Reserve\n Customs\n Factory" },
            blueprints: { name: "Blueprints", icon: "./assets/icons/blueprints.webp", image: "./assets/category/blueprints.webp", desc: "Interchange\n Factory\n The Labyrinth" },
            test: { name: "Test", icon: "./assets/icons/test.webp", image: "./assets/category/test.webp", desc: "Shoreline\n Woods\n Icebreaker" },
            user: { name: "User", icon: "./assets/icons/user.webp", image: "./assets/category/user.webp", desc: "Streets of Tarkov\n Ground Zero\n The Lab" },
            medical: { name: "Medical", icon: "./assets/icons/medical.webp", image: "./assets/category/medical.webp", desc: "The Labyrinth\n Ground Zero\n The Lab" },
            financial: { name: "Financial", icon: "./assets/icons/financial.webp", image: "./assets/category/financial.webp", desc: "Customs\n Streets of Tarkov\n Interchange" },
            transit: { name: "Transit", icon: "./assets/icons/transit.webp", image: "./assets/category/transit.webp", desc: "Transit Point" },
            temporary: { name: "Temporary", icon: "./assets/icons/temporary.png", desc: "Temporary Marker" }
        },
        copyright: "© 2026 EFT BP Map.<br>Fan-made map. Game assets © Battlestate Games."
    }
};