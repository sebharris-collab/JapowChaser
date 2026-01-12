export type Resort = {
    id: string;
    name: string;
    region: string;
    lat: number;
    lon: number;
    webcamUrl?: string;
};

export const JAPANESE_RESORTS: Resort[] = [
    // Hokkaido Resorts (Niseko Split)
    {
        id: "grand-hirafu",
        name: "Niseko Grand Hirafu",
        region: "Hokkaido",
        lat: 42.8622,
        lon: 140.7027,
        webcamUrl: "https://www.youtube.com/watch?v=S016YwQaUyw", // Live camera
    },
    {
        id: "hanazono",
        name: "Niseko Hanazono",
        region: "Hokkaido",
        lat: 42.8724,
        lon: 140.7188,
        webcamUrl: "https://hanazononiseko.com/en/winter/resort/live-camera", // Hanazono Live
    },
    {
        id: "niseko-village",
        name: "Niseko Village",
        region: "Hokkaido",
        lat: 42.8465,
        lon: 140.6784,
        webcamUrl: "https://www.niseko-village.com/en/webcam/", // Embeddable page or fallback
    },
    {
        id: "annupuri",
        name: "Niseko Annupuri",
        region: "Hokkaido",
        lat: 42.8358,
        lon: 140.6583,
        webcamUrl: "https://annupurilodge.com/webcam/",
    },

    // Other Hokkaido
    {
        id: "rusutsu",
        name: "Rusutsu Resort",
        region: "Hokkaido",
        lat: 42.7495,
        lon: 140.9022,
        webcamUrl: "https://rusutsu.com/en/live-mountain-cams/",
    },
    {
        id: "furano",
        name: "Furano Ski Resort",
        region: "Hokkaido",
        lat: 43.3444,
        lon: 142.3835,
        webcamUrl: "https://www.snow-forecast.com/resorts/Furano/webcams/latest",
    },
    {
        id: "kiroro",
        name: "Kiroro Resort",
        region: "Hokkaido",
        lat: 43.0833,
        lon: 140.9833,
        webcamUrl: "https://www.kiroro.co.jp/live-camera/",
    },
    {
        id: "tomamu",
        name: "Tomamu Resort",
        region: "Hokkaido",
        lat: 43.0667,
        lon: 142.6167,
        webcamUrl: "https://www.snow-forecast.com/resorts/Tomamu/webcams/latest",
    },
    {
        id: "sahoro",
        name: "Sahoro Resort",
        region: "Hokkaido",
        lat: 43.2333,
        lon: 142.8667,
        webcamUrl: "https://sahoro-resort.com/livecam/",
    },
    {
        id: "kokusai",
        name: "Sapporo Kokusai",
        region: "Hokkaido",
        lat: 42.9167,
        lon: 141.1833,
        webcamUrl: "https://snowstash.com/japan/hokkaido/sapporo-kokusai/webcams",
    },
    {
        id: "teine",
        name: "Sapporo Teine",
        region: "Hokkaido",
        lat: 43.1167,
        lon: 141.1833,
        webcamUrl: "https://sapporo-teine.com/snow/lang/en/livecam.html",
    },
    {
        id: "asahidake",
        name: "Asahidake",
        region: "Hokkaido",
        lat: 43.6633,
        lon: 142.8533,
        webcamUrl: "https://asahidake.hokkaido.jp/en/live-camera/",
    },

    // Hakuba Resorts (Split)
    {
        id: "happo-one",
        name: "Hakuba Happo-one",
        region: "Nagano",
        lat: 36.7022,
        lon: 137.8524,
        webcamUrl: "https://www.happo-one.jp/en/gelande/livecamera/",
    },
    {
        id: "hakuba-47",
        name: "Hakuba 47",
        region: "Nagano",
        lat: 36.6833,
        lon: 137.8333,
        webcamUrl: "https://www.hakuba47.co.jp/winter/en/live-camera/",
    },
    {
        id: "goryu",
        name: "Hakuba Goryu",
        region: "Nagano",
        lat: 36.6713,
        lon: 137.8428,
        webcamUrl: "https://www.hakubagoryu.com/en/live-camera/",
    },
    {
        id: "iwatake",
        name: "Hakuba Iwatake",
        region: "Nagano",
        lat: 36.7139,
        lon: 137.8639,
        webcamUrl: "https://iwatake-mountain-resort.com/livecamera",
    },
    {
        id: "tsugaike",
        name: "Tsugaike Kogen",
        region: "Nagano",
        lat: 36.7570,
        lon: 137.8839,
        webcamUrl: "https://www.tsugaike.gr.jp/livecamera",
    },
    {
        id: "cortina",
        name: "Hakuba Cortina",
        region: "Nagano",
        lat: 36.7876,
        lon: 137.8884,
        webcamUrl: "https://www.hgp.co.jp/cortina/ski/livecamera/",
    },

    // Other Nagano
    {
        id: "nozawa",
        name: "Nozawa Onsen",
        region: "Nagano",
        lat: 36.9232,
        lon: 138.4418,
        webcamUrl: "https://nozawaski.com/en/webcams/",
    },
    {
        id: "shiga-kogen",
        name: "Shiga Kogen",
        region: "Nagano",
        lat: 36.7444,
        lon: 138.5167,
        webcamUrl: "https://www.shigakogen.gr.jp/english/livecam.html",
    },
    {
        id: "madarao",
        name: "Madarao Kogen",
        region: "Nagano",
        lat: 36.8833,
        lon: 138.3167,
        webcamUrl: "https://www.madaraokogen.com/en/webcam/",
    },
    {
        id: "tangram",
        name: "Tangram Ski Circus",
        region: "Nagano",
        lat: 36.7667,
        lon: 138.2833,
        webcamUrl: "https://www.tangram.jp/eng/lift/",
    },

    // Niigata Resorts
    {
        id: "myoko-kogen",
        name: "Myoko Kogen",
        region: "Niigata",
        lat: 36.9167,
        lon: 138.1667,
        webcamUrl: "https://myokotourism.com/webcams/",
    },
    {
        id: "naeba",
        name: "Naeba",
        region: "Niigata",
        lat: 36.8500,
        lon: 138.8500,
        webcamUrl: "https://www.princehotels.com/en/ski/naeba/webcam/",
    },
    {
        id: "gala-yuzawa",
        name: "GALA Yuzawa",
        region: "Niigata",
        lat: 36.9333,
        lon: 138.8167,
        webcamUrl: "https://gala.co.jp/winter/english/livecam/",
    },
    {
        id: "kagura",
        name: "Kagura",
        region: "Niigata",
        lat: 36.8333,
        lon: 138.8333,
        webcamUrl: "https://www.princehotels.co.jp/ski/kagura/livecam/",
    },
    {
        id: "ishiuchi-maruyama",
        name: "Ishiuchi Maruyama",
        region: "Niigata",
        lat: 36.9167,
        lon: 138.7833,
        webcamUrl: "https://ishiuchi.or.jp/livecamera/",
    },
    {
        id: "joetsu-kokusai",
        name: "Joetsu Kokusai",
        region: "Niigata",
        lat: 36.9500,
        lon: 138.5833,
    },

    // Gunma Resorts
    {
        id: "minakami",
        name: "Minakami",
        region: "Gunma",
        lat: 36.7833,
        lon: 138.9500,
        webcamUrl: "https://www.enjoy-minakami.jp/livecamera",
    },
    {
        id: "tambara",
        name: "Tambara",
        region: "Gunma",
        lat: 36.7333,
        lon: 139.1167,
        webcamUrl: "https://www.tambara.co.jp/winter/livecamera/",
    },

    // Yamagata Resorts
    {
        id: "zao",
        name: "Zao Onsen",
        region: "Yamagata",
        lat: 38.1500,
        lon: 140.4167,
        webcamUrl: "https://www.zao-ski.or.jp/livecamera/",
    },

    // Iwate Resorts
    {
        id: "appi-kogen",
        name: "Appi Kogen",
        region: "Iwate",
        lat: 39.9500,
        lon: 140.9500,
        webcamUrl: "https://www.youtube.com/watch?v=live_stream_id_placeholder", // Often has live streams, need to check if persistent
    },
    {
        id: "geto-kogen",
        name: "Geto Kogen",
        region: "Iwate",
        lat: 39.3333,
        lon: 140.8333,
        webcamUrl: "https://www.getokogen.com/winter/03gelende/livecam.html",
    },

    // Akita Resorts
    {
        id: "tazawako",
        name: "Tazawako",
        region: "Akita",
        lat: 39.7833,
        lon: 140.6833,
        webcamUrl: "https://www.tazawako-ski.com/",
    },

    // Gifu Resorts
    {
        id: "takasu",
        name: "Takasu Snow Park",
        region: "Gifu",
        lat: 35.9167,
        lon: 136.9167,
        webcamUrl: "https://www.takasu.gr.jp/livecam/",
    },
    {
        id: "dynaland",
        name: "Dynaland",
        region: "Gifu",
        lat: 35.9333,
        lon: 136.9333,
        webcamUrl: "https://www.dynaland.co.jp/livecam/",
    },
];
