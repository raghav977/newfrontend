export default function AuthLayout({children,imagesrc,imageAlt}){
    return(
        <div className="flex h-screen">
            {/* left side ko image */}
            <div className="w-1/2 hidden md:block">
            <img src={imagesrc} alt={imageAlt || 'Background'} className="w-full h-full object-cover"/>
            </div>

            {/* right side ko lagi */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
            <div className="max-w-md w-full">{children}</div>


            </div>


        </div>
        )

}