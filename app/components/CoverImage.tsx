import React from "react";

export type CoverImageProps = {
    imageUrl?: string;
    children?: React.ReactNode;
}

export default function CoverImage({imageUrl = '/images/cover-image-forest.png', children}: CoverImageProps) {
    return (
        <header
            className="cover-image"
            style={{backgroundImage: `url(${imageUrl})`}}
        >
            <div className="title-wrapper">
                {children}
            </div>
        </header>
    );
}
