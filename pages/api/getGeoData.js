// /api/getGeoData.js
// export default function handler(req, res) {
//     // 模拟返回的GeoJSON数据
//     // const geoData = {
//     //     type: "FeatureCollection",
//     //     features: [
//     //         {
//     //             type: "Feature",
//     //             geometry: {
//     //                 type: "Point",
//     //                 coordinates: [51.505, -0.09]
//     //             },
//     //             properties: {
//     //                 name: "Location 1"
//     //             }
//     //         }
//     //         // 可以添加更多点数据
//     //     ]
//     // };
//     const geoData = fetch("data/SPI1_Yearly_thailand_1950_2016.json");
//     res.status(200).json(geoData);
// }

import path from "path";
import fs from "fs";

export default function handler(req, res) {
    const filePath = path.join(
        process.cwd(),
        "data",
        "SPI1_Yearly_Thailand_1950_2016.json"
    ); // 修改为你的文件路径
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res
                .status(500)
                .json({ error: `Failed to read file from: ${filePath}` });
        }
        res.status(200).json(JSON.parse(data)); // 返回 JSON 数据
    });
}
