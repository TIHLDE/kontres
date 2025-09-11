'use client';

import styles from './welcometitle.module.css';

const WelcomeTitle = () => {
    return (
        <h1
            className={`text-5xl md:text-7xl font-bold mx-auto text-center text-transparent py-3 ${styles.title}`}
        >
            Book TIHLDEs <br /> lokaler og utstyr
        </h1>
    );
};

export default WelcomeTitle;
