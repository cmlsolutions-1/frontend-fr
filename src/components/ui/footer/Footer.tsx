import { titleFont } from '@/config/fonts';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <div className="flex w-full justify-center text-xs mb-10">

      <Link
        to='/'
      >
        <span className={`${ titleFont.className } antialiased font-bold `}>Ferrelectricos </span>
        <span>| Restrepo </span>
        <span>© { new Date().getFullYear() }</span>
      </Link>

      <Link
        to='/'
        className="mx-3"
      >
        Privacidad & Legal
      </Link>

      <Link
        to='/'
        className="mx-3"
      >
        Ubicaciones
      </Link>


    </div>
  )
}