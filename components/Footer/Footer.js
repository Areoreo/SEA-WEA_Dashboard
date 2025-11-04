import { SectionContainer } from "@components/Section";
import { ButtonGroup } from "@components/Button";
import { Icon } from "@iconify/react";
import { getAssetPath } from "@utils/pathUtils";

const DATA = [
    // {
    //     title: "Keys",
    //     items: [
    //         {
    //             label: "Countries",
    //             href: "#countries"
    //         },
    //         {
    //             label: "Features",
    //             href: "#features"
    //         },
    //         {
    //             label: "FAQ",
    //             href: "#faq"
    //         }
    //     ]
    // },
    {
        title: "Our Organization",
        items: [
            {
                label: "Github",
                href: "https://github.com/christian-luntok/",
                target: "_blank",
            },
            {
                label: "Twitter",
                href: "https://github.com/christian-luntok/",
                target: "_blank",
            },
            {
                label: "Instagram",
                href: "https://github.com/christian-luntok/",
                target: "_blank",
            },
            {
                label: "Facebook",
                href: "https://github.com/christian-luntok/",
                target: "_blank",
            },
        ],
    },
];

export const Footer = () => {
    const date = new Date();
    const year = date.getFullYear();
    const dashboardHref = getAssetPath("/dashboard_page/");
    const logoSrc = getAssetPath("/rice_logo.png");

    return (
        <footer id="footer" className="bg-white">
            {/* Footer Links */}
            <SectionContainer className="footer--container wrap wrap-px relative z-10">
                <div className="footer--content-container py-16">
                    <div className="footer-links mb-12 grid grid-cols-2 gap-8 md:mb-16 md:grid-cols-8 lg:grid-cols-12">
                        <div className="col-span-6">
                            <div className="footer--logo grid gap-8">
                                <a href={dashboardHref} className="inline-block">
                                    <img
                                        src={logoSrc}
                                        alt="logo"
                                        className="h-50 w-auto"
                                        height="25"
                                        width="200"
                                        loading="lazy"
                                    />
                                </a>
                                {/* Get Template button; remove if not used */}
                                <ButtonGroup alignment="left">
                                    <a
                                        role="button"
                                        href={dashboardHref}
                                        className="btn btn--secondary"
                                    >
                                        Explore Dashboard
                                        <Icon icon="material-symbols:arrow-forward-rounded" />
                                    </a>
                                </ButtonGroup>
                            </div>
                        </div>
                        <div className="col-span-6">
                            <div className="footer-menu grid grid-cols-2 md:grid-cols-8 lg:grid-cols-12">
                                {DATA.map((footerLinks) => (
                                    <div
                                        key={footerLinks.title}
                                        className="footer-menu--container col-span-1 md:col-span-4"
                                    >
                                        <h3 className="font-bold text-base mb-2">
                                            {footerLinks.title}
                                        </h3>
                                        <ul className="footer-menu--list">
                                            {footerLinks.items.map((footerItem) => (
                                                <li
                                                    key={footerItem.label}
                                                    className="footer-menu--list-item gap-2"
                                                >
                                                    <a
                                                        className="mb-2 block w-auto font-medium transition-colors duration-300 hover:underline"
                                                        href={footerItem.href}
                                                        target={footerItem.target}
                                                    >
                                                        {footerItem.label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </SectionContainer>
            {/* Footer Credits */}
            {/* <SectionContainer className="footer-credits relative z-10">
                <div className="wrap wrap-px py-6">
                    <p className="my-0">© {year} PREP-NEXT. All rights reserved.</p>
                </div>
            </SectionContainer> */}
            <div className="footer--background"></div>
        </footer>
    );
};
