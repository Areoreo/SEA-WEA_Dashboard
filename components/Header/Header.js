import { SectionContainer } from "@components/Section";
// import { Nav } from "@components/Nav";
import { ResponsiveNavbar } from "@components/responsive";
import { ButtonGroup } from "@components/Button";
import { Icon } from "@iconify/react";
import { getAssetPath } from "@utils/pathUtils";

export const Header = () => {
    const dashboardHref = getAssetPath("/dashboard_page/");
    const logoSrc = getAssetPath("/rice_logo.png");

    return (
        <header
            id="header"
            className="header fixed left-0 w-full z-[9999] top-0 bg-white backdrop-filter backdrop-blur-md bg-opacity-50"
        >
            <SectionContainer className="header--container wrap wrap-px ">
                <div className="header-logo--container">
                    <h1 className="logo mb-0">
                        <a href={dashboardHref} className="inline-block">
                            <img
                                src={logoSrc}
                                alt="logo"
                                className="h-12 w-auto"
                                height="60"
                                width="300"
                                loading="lazy"
                            />
                        </a>
                    </h1>
                </div>
                <SectionContainer className="flex items-center ml-auto">
                    <ResponsiveNavbar />
                    <ButtonGroup className="hidden md:block">
                        <a role="button" href={dashboardHref} className="btn btn--secondary ml-4">
                            Explore Dashboard
                            <Icon icon="material-symbols:arrow-forward-rounded" />
                        </a>
                    </ButtonGroup>
                </SectionContainer>
            </SectionContainer>
        </header>
    );
};
