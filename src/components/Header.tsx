import Image from "next/image";
import Link from "next/link";
import wordmark from "../../public/perminal-wordmark.svg";


export function Header() {
  return (
    <header className="flex h-9 w-full items-center justify-between pr-3">
      <Link
        href="/"
        aria-label="Perminal home"
        className="flex h-9 items-end gap-[1.704px] p-[6.817px]"
      >
        <Image
          src={wordmark}
          alt="Perminal"
          priority
          width={117.159}
          height={22.367}
          className="h-[22.367px] w-auto"
        />
        <div className="relative h-[4.357px] w-[18.049px]" data-node-id="260:4422">
          <div className="absolute h-[4.357px] left-0 top-0 w-[18.049px]" data-node-id="260:4423" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 18.049 4.357\\' preserveAspectRatio=\\'none\\'><g transform=\\'matrix(-0.90247 2.6679e-17 -1.1052e-16 -0.21785 9.0247 2.1785)\\'><foreignObject x=\\'-190\\' y=\\'-190\\' width=\\'380\\' height=\\'380\\'><div xmlns=\\'http://www.w3.org/1999/xhtml\\' style=\\'background-image: conic-gradient(from 90deg, rgb(255, 77, 158) -10%, rgb(255, 111, 119) -6.5385%, rgb(255, 146, 79) -3.0769%, rgb(255, 180, 40) 0.38462%, rgb(255, 197, 20) 2.1154%, rgb(255, 205, 10) 2.9808%, rgb(255, 214, 0) 3.8462%, rgb(255, 176, 0) 12.923%, rgb(255, 138, 0) 22%, rgb(255, 121, 16) 24.25%, rgb(255, 104, 32) 26.5%, rgb(255, 69, 64) 31%, rgb(255, 35, 96) 35.5%, rgb(255, 17, 112) 37.75%, rgb(255, 0, 128) 40%, rgb(223, 18, 144) 41.875%, rgb(191, 36, 160) 43.75%, rgb(159, 54, 176) 45.625%, rgb(128, 72, 192) 47.5%, rgb(96, 90, 207) 49.375%, rgb(64, 108, 223) 51.25%, rgb(32, 126, 239) 53.125%, rgb(16, 135, 247) 54.063%, rgb(0, 144, 255) 55%, rgb(0, 200, 197) 63.5%, rgb(0, 255, 139) 72%, rgb(16, 244, 140) 73.125%, rgb(32, 233, 141) 74.25%, rgb(64, 211, 144) 76.5%, rgb(96, 188, 146) 78.75%, rgb(128, 166, 148) 81%, rgb(191, 122, 153) 85.5%, rgb(255, 77, 158) 90%, rgb(255, 111, 119) 93.462%, rgb(255, 146, 79) 96.923%, rgb(255, 180, 40) 100.38%, rgb(255, 197, 20) 102.12%, rgb(255, 205, 10) 102.98%, rgb(255, 214, 0) 103.85%); opacity:1; height: 100%; width: 100%;\\'></div></foreignObject></g></svg>')" }} />
          <div className="absolute blur-[0.778px] h-[4.357px] left-0 top-0 w-[18.049px]" data-node-id="260:4424" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 18.049 4.357\\' preserveAspectRatio=\\'none\\'><g transform=\\'matrix(-0.90247 2.6679e-17 -1.1052e-16 -0.21785 9.0247 2.1785)\\'><foreignObject x=\\'-190\\' y=\\'-190\\' width=\\'380\\' height=\\'380\\'><div xmlns=\\'http://www.w3.org/1999/xhtml\\' style=\\'background-image: conic-gradient(from 90deg, rgb(255, 77, 158) -10%, rgb(255, 111, 119) -6.5385%, rgb(255, 146, 79) -3.0769%, rgb(255, 180, 40) 0.38462%, rgb(255, 197, 20) 2.1154%, rgb(255, 205, 10) 2.9808%, rgb(255, 214, 0) 3.8462%, rgb(255, 176, 0) 12.923%, rgb(255, 138, 0) 22%, rgb(255, 121, 16) 24.25%, rgb(255, 104, 32) 26.5%, rgb(255, 69, 64) 31%, rgb(255, 35, 96) 35.5%, rgb(255, 17, 112) 37.75%, rgb(255, 0, 128) 40%, rgb(223, 18, 144) 41.875%, rgb(191, 36, 160) 43.75%, rgb(159, 54, 176) 45.625%, rgb(128, 72, 192) 47.5%, rgb(96, 90, 207) 49.375%, rgb(64, 108, 223) 51.25%, rgb(32, 126, 239) 53.125%, rgb(16, 135, 247) 54.063%, rgb(0, 144, 255) 55%, rgb(0, 200, 197) 63.5%, rgb(0, 255, 139) 72%, rgb(16, 244, 140) 73.125%, rgb(32, 233, 141) 74.25%, rgb(64, 211, 144) 76.5%, rgb(96, 188, 146) 78.75%, rgb(128, 166, 148) 81%, rgb(191, 122, 153) 85.5%, rgb(255, 77, 158) 90%, rgb(255, 111, 119) 93.462%, rgb(255, 146, 79) 96.923%, rgb(255, 180, 40) 100.38%, rgb(255, 197, 20) 102.12%, rgb(255, 205, 10) 102.98%, rgb(255, 214, 0) 103.85%); opacity:1; height: 100%; width: 100%;\\'></div></foreignObject></g></svg>')" }} />
        </div>
      </Link>

      <a
        href="https://x.com/useperminal"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Perminal on X"
        className="flex size-[18px] items-center justify-center text-black transition-opacity hover:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
    </header>
  );
}
