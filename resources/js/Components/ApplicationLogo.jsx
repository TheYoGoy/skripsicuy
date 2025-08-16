export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/logo.png"
            alt="Logo"
            className="h-12 w-12" // ubah h-10 jadi h-16 atau lebih besar
        />
    );
}