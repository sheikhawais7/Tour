import React, { useEffect } from 'react'
import { useGalleryContext } from 'Context/GalleryContext'
import { Link } from 'react-router-dom'
import logo from "../assets/logo.png"
import img from "../assets/noPage.png"
import { useNavigate } from 'react-router-dom'

export default function ImageGallery() {

    const [gallery] = useGalleryContext()
    const navigate = useNavigate()
    gallery.shift()
    console.log(gallery)

    useEffect(() => {
        if (gallery.length === 0) {
            navigate("/agent");
        }
        else{
        }
    }, [gallery, navigate]);
    return (
        <div className='image_gallery'>
            <Link to={"/"}>
                <img src={logo} style={{ width: "60px", margin: "41px 0px 11px 41px", borderRadius: "50%" }} alt="logo" />
            </Link>
            <main>
                <h1 className="text-center fw-bold my-5 text-light ">
                    Image Gallery
                </h1>
                <>
                    {gallery.length > 0 && (
                        <div className="container">
                            <div className="row ">
                                {/* <ul> */}
                                {gallery.map((image, i) => (
                                    <div className="col-12 col-md-4 col-sm-6 my-4">
                                        {image.imageUrl ? (
                                            <div className='w-100 d-flex justify-content-center align-items-center flex-column' key={i}>
                                                <img
                                                    src={image.imageUrl}
                                                    alt={image.keyword}
                                                    style={{ width: '100px', marginLeft: '10px', borderRadius: '12px' }}
                                                    onError={(e) => {
                                                        console.warn(`Failed to load image for ${image.keyword}. Error: ${e}`);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <div className='text-light fw-bold text-center'>
                                                    {image.keyword.length > 4 ? image.keyword.slice(2, -2) : image.keyword}
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ marginLeft: '10px', color: 'red' }}></span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <Link to={"/agent"} style={{ "textDecoration": "none" }} className='d-flex justify-content-center'>
                        <button className="image-button ">Agent</button>
                    </Link>
                </>
            </main>
        </div>
    )

}
