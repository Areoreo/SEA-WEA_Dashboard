import { SectionContainer } from "@components/Section";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { v4 as uuid } from "uuid";

const ContentImageData = [
    {
        id: uuid(),
        // title: "India",
        content: (
                <div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <caption className="text-lg font-semibold text-gray-800 text-center py-4">
                            Annual Rice Planting Area for {`India`}
                        </caption>
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Year
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    Rice Planting Area (ha)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    2015
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                    123,000
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    2016
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                    130,000
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    2017
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                    125,000
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    2018
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                    128,000
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    2019
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                    135,000
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    2020
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                    140,000
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    2021
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                    145,000
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
        ),  
        align: "right",
        image: "/India.png"
    },
    {
        id: uuid(),
        title: "Thailand",
        content: (
            <div>
                <table className="min-w-full divide-y divide-gray-200">
                    <caption className="text-lg font-semibold text-gray-800 text-center py-4">
                        Annual Rice Planting Area for {`Thailand`}
                    </caption>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Year
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Rice Planting Area (ha)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2015
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                123,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2016
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                130,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2017
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                125,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2018
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                128,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2019
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                135,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2020
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                140,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2021
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                145,000
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    ),  
        align: "left",
        image: "/thailand.png"
    },
    {
        id: uuid(),
        title: "Vietnam",
        content: (
            <div>
                <table className="min-w-full divide-y divide-gray-200">
                    <caption className="text-lg font-semibold text-gray-800 text-center py-4">
                        Annual Rice Planting Area for {`Vietnam`}
                    </caption>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Year
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Rice Planting Area (ha)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2015
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                123,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2016
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                130,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2017
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                125,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2018
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                128,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2019
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                135,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2020
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                140,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2021
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                145,000
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    ),  
        align: "right",
        image: "/Vietnam.png"
    },
    {
        id: uuid(),
        title: "Laos",
        content: (
            <div>
                <table className="min-w-full divide-y divide-gray-200">
                    <caption className="text-lg font-semibold text-gray-800 text-center py-4">
                        Annual Rice Planting Area for {`Laos`}
                    </caption>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Year
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Rice Planting Area (ha)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2015
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                123,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2016
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                130,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2017
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                125,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2018
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                128,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2019
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                135,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2020
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                140,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2021
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                145,000
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    ),  
        align: "left",
        image: "/Laos.png"
    },
    {
        id: uuid(),
        title: "Myanmar",
        content: (
            <div>
                <table className="min-w-full divide-y divide-gray-200">
                    <caption className="text-lg font-semibold text-gray-800 text-center py-4">
                        Annual Rice Planting Area for {`Myanmar`}
                    </caption>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Year
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Rice Planting Area (ha)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2015
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                123,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2016
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                130,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2017
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                125,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2018
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                128,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2019
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                135,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2020
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                140,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2021
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                145,000
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    ),  
        align: "right",
        image: "/Myanmar.png"
    },
    {
        id: uuid(),
        title: "Cambodia",
        content: (
            <div>
                <table className="min-w-full divide-y divide-gray-200">
                    <caption className="text-lg font-semibold text-gray-800 text-center py-4">
                        Annual Rice Planting Area for {`Cambodia`}
                    </caption>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Year
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Rice Planting Area (ha)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2015
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                123,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2016
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                130,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2017
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                125,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2018
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                128,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2019
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                135,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2020
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                140,000
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                2021
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                                145,000
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    ),  
        align: "left",
        image: "/Cambodia.png"
    }

];

export const ContentImage = () => {
    return (
        <SectionContainer className="process-items mt-16 space-y-16">
            {ContentImageData.map((item) => (
                <div
                    id={item.id}
                    key={item.id}
                    // className="process-item--container grid md:grid-cols-2 gap-y-8"
                    className="process-item--container grid md:grid-cols-2 gap-8 items-center"
                >
                    <div
                        className={`process-item--image rounded-full overflow-hidden ${
                            item.align === "left" ? "md:order-1 md:ml-4 lg:ml-16" : ""
                        }`}
                         style={{
                                    position: "relative",
                                    width: "70%",
                                    maxWidth: "512px",
                                    height: "0px",
                                    paddingBottom: "70%", 
                                    borderRadius: "50%",
                                    boxShadow: "inset -20px -20px 60px rgba(0, 0, 0, 0.2), inset 20px 20px 60px rgba(255, 255, 255, 0.5), 0px 0px 30px rgba(0, 0, 0, 0.1)",
                                    background: "linear-gradient(145deg, #e6e6e6, #ffffff)"
                                }}
                    >
                        <Image
                            src={item.image}
                            layout="fill"
                            objectFit="cover"
                            alt="Process Banner 1"
                            style={{
                                borderRadius: "50%",
                                transform: "translateZ(30px)"
                            }}
                        />
                    </div>
                    <div
                        className={`process-item--content ${
                            item.align === "left"
                                ? "md:pr-16 lg:pr-24 xl:pr-32 ml-auto"
                                : "md:pl-16 lg:pl-24 xl:pl-32  mr-auto"
                        } my-auto content text-black/60`}
                    >
                        <h3 className="mb-6 h4 md:h3 font-semibold text-black">
                            {item.title}
                        </h3>
                        {typeof item.content === 'string' ? (
                            <p>{item.content}</p>
                            ) : (
                            <div>{item.content}</div>
                        )}
                        <ul className="process-item--list space-y-3">
                            {item.listItems?.length &&
                                item.listItems.map((listItem) => (
                                    <li
                                        id={listItem.id}
                                        key={listItem.id}
                                        className="inline-grid grid-flow-col-dense"
                                    >
                                        <Icon
                                            icon="ph:seal-check-bold"
                                            className="w-6 h-6 text-secondary-500 mr-2"
                                        />
                                        {listItem.content}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            ))}
        </SectionContainer>
    );
};
