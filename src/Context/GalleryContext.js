import React, { createContext, useContext, useState } from 'react'

// Capitalize the context name
const GalleryContext = createContext()

export default function GalleryContextProvider(props) {
    const [gallery, setGallery] = useState([])
    return (
        <GalleryContext.Provider value={[gallery, setGallery]}>
            {props.children}
        </GalleryContext.Provider>
    )
}

export const useGalleryContext = () => useContext(GalleryContext)
