import {Link} from "react-router";

export default function Footer() {
    return <footer>
        <div className='footer-container'>
            <div className='copyright'>
                <p className='text-secondary'>&copy; {new Date().getFullYear()}</p>
            </div>
            <ul className='links'>
                <li><Link to="/contact">Contact us</Link></li>
                <li><Link to="/privacy">Privacy notice</Link></li>
                <li><Link to="/cookies">Cookie policy</Link></li>
                <li><Link to="/accessibility">Accessibility</Link></li>
            </ul>
        </div>
    </footer>
}
