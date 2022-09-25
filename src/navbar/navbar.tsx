import React from 'react'

interface navbarProps {
    menubar: boolean
    setMenubarDisplay: (arg0: boolean) => void
}

function navbar(props: navbarProps) {
    return (
        <React.Fragment>
            <nav className="relative w-full flex flex-wrap items-center justify-between py-4 bg-purple-800 text-white">
                <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
                    <div className="container-fluid">
                        <a className="font-mono text-center text-xl block" href="/">i/o/ctl</a>
                    </div>
                    <a onClick={() => props.setMenubarDisplay(!props.menubar)} className="font-mono text-center text-xl block">{props.menubar ? 'editor' : 'menu'}</a>
                </div>
            </nav>
        </React.Fragment>

    )
}

export default navbar
