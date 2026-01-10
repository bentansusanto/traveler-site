import { Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  products: [
    { name: "Tour", href: "/tour" },
    { name: "Car Rental", href: "/car-rental" },
    { name: "Flights", href: "/flights" },
    { name: "Hotel", href: "/hotel" },
    { name: "Documents & Visa", href: "/documents" },
    { name: "Bus & Shuttle", href: "/bus-shuttle" }
  ],
  company: [
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" }
  ],
  customerSupport: [
    {
      page: "Feedback",
      link: "/"
    },
    {
      page: "Privacy & Policy",
      link: "/"
    },
    {
      page: "Terms & Condition",
      link: "/"
    }
  ],
  companyPartner: [
    {
      name: "iata",
      logo: "iata.png"
    },
    {
      name: "turkiye",
      logo: "turkiye.png"
    },
    {
      name: "tursab",
      logo: "tursablogo.png"
    },
    {
      name: "wonderful indonesia",
      logo: "wonderful-indonesia.png"
    },
    {
      name: "pasificvee",
      logo: "logo-pasificvee.png"
    }
  ]
};

const contact = {
  address: "Ruko Vila Delima No. 7, Jl. Karang Tengah Raya Kav. 9, Jakarta Selatan",
  phone: ["+6221 2765 3200", "+62 811 209 299", "+62 816 836 939"]
};

const socialMedia = [
  {
    name_social_media: "Instagram",
    link: "https://instagram.com"
  },
  {
    name_social_media: "Youtube",
    link: "https://youtube.com"
  },
  {
    name_social_media: "Facebook",
    link: "https://facebook.com"
  }
];

export const Footer = () => {
  const date = new Date().getFullYear();
  return (
    <div className="mt-3 md:mt-10 bg-white md:bg-transparent border-t-2 pb-12 md:pb-0 border-dashed md:border-t-0 border-gray-200 py-10 px-5 md:px-8 lg:mx-auto lg:max-w-5xl lg:px-0 xl:max-w-[80%]">
      <div className="flex flex-col items-start space-y-10 space-x-0 md:flex-row md:space-y-0 md:space-x-20">
        <div className="space-y-5 lg:max-w-sm">
          <div>
            <Image
              src="/images/logo-pacific-travelindo.svg"
              width={80}
              height={80}
              alt="logo-travelindo"
            />
          </div>
          <div className="max-w-auto space-y-3 md:max-w-xs">
            <p className="text-gray-500">
              Explore mesmerizing destinations, handpicked journeys, and memorable escapades await
              you.
            </p>
          </div>
          {/* social media */}
          <div className="flex items-center space-x-3">
            {socialMedia?.map((list: any, idx: any) => (
              <div
                key={idx}
                className="rounded-full bg-white p-2 text-orange-500 transition-all duration-500 hover:bg-orange-500 hover:text-white md:p-3">
                {list.name_social_media === "Instagram" ? (
                  <Link href={list.link}>
                    <Instagram className="text-lg md:text-xl" />
                  </Link>
                ) : list.name_social_media === "Facebook" ? (
                  <Link href={list.link}>
                    <Facebook className="text-lg md:text-xl" />
                  </Link>
                ) : (
                  <Link href={list.link}>
                    <Youtube className="text-lg md:text-xl" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* services, customer support, company, newsletter */}
        <div className="flex flex-wrap gap-10 md:gap-20">
          {/* services */}
          <div className="space-y-5">
            <p className="font-semibold">Our Services</p>
            <ul className="space-y-5">
              {footerLinks.products.map((list, idx) => (
                <li key={idx} className="text-gray-600">
                  <Link href={list.href}>{list.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* company */}
          <div className="space-y-5">
            <p className="font-semibold">Company</p>
            <ul className="space-y-5">
              {footerLinks.company.map((list, idx) => (
                <li key={idx} className="text-gray-600">
                  <Link href={list.href}>{list.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* services */}
          <div className="space-y-5">
            <p className="font-semibold">Customer Support</p>
            <ul className="space-y-5">
              {footerLinks.customerSupport.map((list, idx) => (
                <li key={idx} className="text-gray-600">
                  <Link href={list.link}>{list.page}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* contact us */}
          <div className="max-w-xs space-y-5">
            <p className="font-semibold">Contact Us</p>
            <p className="text-gray-600">{contact.address}</p>
            {contact.phone.map((list, idx) => (
              <p key={idx} className="leading-relaxed text-gray-600">
                {list} <br /> (Whatsapp)
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col-reverse items-center justify-between gap-5 border-t border-gray-200 py-5 lg:flex-row lg:gap-0">
        <footer className="text-start text-sm text-gray-500 md:text-[16px]">
          ©{date}, PT Pasifik Trafel Indonesia
        </footer>
        <div className="flex flex-wrap items-center gap-5">
          {footerLinks.companyPartner.map((logo, idx) => (
            <div key={idx} className={`${logo.name === "pasificvee" && "w-28"} w-14`}>
              <Image
                src={`/images/${logo.logo}`}
                width={80}
                height={80}
                alt="logo-company-partner"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
