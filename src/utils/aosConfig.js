// AOS Configuration
import AOS from 'aos';
import 'aos/dist/aos.css';

export const initAOS = () => {
  if (typeof window !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100,
      delay: 50,
      anchorPlacement: 'top-bottom'
    });
  }
};

export const refreshAOS = () => {
  if (typeof window !== 'undefined') {
    AOS.refresh();
  }
};

export default AOS;
