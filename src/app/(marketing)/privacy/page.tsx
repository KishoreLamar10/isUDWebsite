import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - isUD',
  description: 'Privacy Policy for thisisUD.com.',
};

const sections = [
  {
    title: 'Types of Information Collected',
    paragraphs: [
      'In order to better provide you with our numerous services, we collect two types of information about our users: personally identifiable information and non-personally identifiable information. Our primary goal in collecting information from you is to provide you with a smooth, efficient, and customized experience while using thisisUD.com.',
      'Personally Identifiable Information (PII): This refers to information that lets us know the specifics of who you are. When you engage in certain activities on thisisUD.com, such as registering or purchasing products or services, we may ask you to provide certain information about yourself such as your first and last name, address, telephone number, e-mail address, credit card number, and/or other PII, by filling out and submitting an online form. It is completely optional for you to engage in these activities. If you do not wish to provide this information, you do not need to create an account or purchase products or services. We may also collect information from you at other points on thisisUD.com that state that such information is being collected. However, this policy is subject to change without notice and we encourage you to periodically check our Privacy Policy.',
      'Non-Personally Identifiable Information (Non-PII): This refers to information that does not by itself identify a specific individual. We may gather certain general information about you based upon where and how you visit thisisUD.com in several ways. This information may be compiled and analyzed on both an individual and an aggregated basis. This information may include the Uniform Resource Locator (URL) that you just came from when you visited thisisUD.com, which URL you next go to, what browser you are using, and/or your Internet Protocol (IP) address. A URL is the global address of documents and other resources on the internet. An IP address is an identifier for a computer or device on a Transmission Control Protocol/Internet Protocol (TCP/IP) network, such as the internet. Networks like the internet use the TCP/IP protocol to route information based on the IP address of the destination. In other words, an IP address is a number that is automatically assigned to your computer whenever you are surfing the Web or allowing Web servers to locate and identify your computer. Computers require IP addresses in order for users to communicate on the internet.',
      'We only use your PII to provide our services to you. We DO NOT share your PII with anyone else except as necessary to provide services. We may use PII to deliver information to you and to contact you regarding administrative notices. We may also use PII to resolve disputes, troubleshoot problems, and enforce our agreements with you. We will also use Non-PII to enhance the smooth operation of thisisUD.com, improve our marketing and promotional efforts, statistically analyze thisisUD.com’s use, improve our service offerings, and customize thisisUD.com’s content, layout, and services. We DO NOT share your Non-PII with anyone else.',
    ],
  },
  {
    title: 'Online Services',
    paragraphs: [
      'When you register with thisisUD.com, we collect your name, email address, and other information necessary to service your account. You acknowledge that by signing up for online services you are also opting in for e-mail announcements or alerts. We will use your email address to send you updates and alerts on thisisUD.com and/or other IDEA related information. This helps us keep you informed of our online services and better serve you. You may unsubscribe from marketing related emails but may continue to receive emails related to your thisisUD.com account and services. You will not receive any electronic or other correspondence from third parties, except those directly related to services provided or purchased from thisisUD.com.',
    ],
  },
  {
    title: 'Compelled Disclosure',
    paragraphs: [
      'If we are required by law to disclose the information that you have submitted, we will attempt to provide you with notice (unless we are prohibited) that a request for your information has been made in order to give you an opportunity to object to the disclosure. We will attempt to provide this notice by email, if you have given us an email address, or by postal mail if you have entered a postal address. We will independently object to overly broad requests for access to information about users of thisisUD.com. If you do not challenge the disclosure request, we may be legally required to turn over your information to law enforcement agencies or a court of competent jurisdiction.',
    ],
  },
  {
    title: 'Updating and Correcting Information',
    paragraphs: [
      'We believe you should have the ability to access and edit the PII that you have provided to us. You may change any of your PII in your account by editing your profile or emailing us at:',
      'ap-idea@buffalo.edu',
      'Please include your name, address, and/or e-mail address when you contact us.',
      'We encourage you to promptly update your PII if it ever changes. You may ask to have the information on your account deleted or removed. While we will comply to the best of our ability, it may be impossible to completely delete your information without some residual information remaining due to periodic data backups.',
    ],
  },
  {
    title: 'Security of Information',
    paragraphs: [
      'At thisisUD.com, you can be assured that your PII is secure, consistent with current industry standards. The importance of security for all PII associated with our users is of utmost concern to us. We use a variety of security technologies and procedures to help protect your personal information from unauthorized access, use, or disclosure. For example, we may store your personal information on computer systems with limited access, which are located in controlled facilities. When we transmit highly confidential information (such as a credit card number or password) over the internet, we protect it through the use of encryption, such as the Secure Socket Layer (SSL) 256-bit encryption protocol, which is the industry standard and prevents unauthorized parties from viewing such information when it is transmitted.',
      'In order to most efficiently serve you, credit card transactions are directly handled by established third-party banking and processing agents who receive the information needed to verify and authorize your credit card or other payment information. IDEA does not currently receive any of your credit card information; however, this policy is subject to change.',
      'Unfortunately, no data transmission over the internet or any wireless network can be guaranteed to be 100% secure. As a result, while we conscientiously strive to protect your PII, you acknowledge that: (a) there are security and privacy limitations of the internet that are beyond our control; (b) the security, integrity, and privacy of any and all information and data exchanged between you and us through the thisisUD.com cannot be guaranteed; and (c) it is possible that any such information and data may be viewed or tampered with by a third party while in transit.',
    ],
  },
  {
    title: 'Privacy Policies of Third-party Sites',
    paragraphs: [
      'As a public service, we may maintain links to other web sites. Except as otherwise discussed in this Policy, this document only addresses the use and disclosure of information we collect from you. Other sites accessible through thisisUD.com have their own privacy policies and data collection, use, and disclosure practices. For more information on this topic, please consult each specific site’s privacy policy. You acknowledge and agree that IDEA is not responsible for the policies or practices of third parties.',
    ],
  },
  {
    title: 'Updates',
    paragraphs: [
      'We may update this Privacy Policy from time to time and encourage you to check back periodically and review our most updated Statement.',
    ],
  },
  {
    title: 'Questions',
    paragraphs: [
      'If you have any questions regarding this Privacy Policy, please contact us at ap-idea@buffalo.edu or by telephone at +1 (716) 829.5902.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        <article className="max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-wider text-secondary">Legal</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
            Privacy Policy
          </h1>

          <div className="mt-8 space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
            <p>
              This Privacy Policy (“Policy”) discloses the privacy practices for: (i) thisisUD.com and various related services. The University at Buffalo Center for Inclusive Design and Environmental Access (IDEA), provider of thisisUD.com, is committed to protecting your privacy online. Please read the information below to learn our policies regarding your use of thisisUD.com.
            </p>
            <p>
              You acknowledge that this policy is part of thisisud.com’s terms of use, and by accessing or using thisisud.com, you agree to be bound by the policy. If you do not wish to be bound by the policy, please exit the site now. Your remedy for dissatisfaction with our policy or the services provided on or through thisisud.com, is to stop using thisisud.com. Your agreement with us regarding compliance with the policy becomes effective immediately upon commencement of your use of thisisud.com.
            </p>
            <p>
              In general, you can visit thisisUD.com on the internet without telling us who you are or giving us your personally identifiable information. As to all of the information described below, IDEA will not give, sell, rent or exchange any information with anyone else without your prior consent except as compelled by law (see below). When we collect information from you, you may tell us that you do not want it used for further marketing contact and we will respect your wishes.
            </p>
            <p>
              We reserve the right to change this Policy at any time and from time to time. Such changes, modifications, additions, or deletions shall be effective immediately upon notice thereof, which may be given by means including, but not limited to, issuing an e-mail to the e-mail address that you listed when registering and/or posting the revised Policy on this page. You acknowledge and agree that it is your responsibility to review this Policy periodically, and be aware of any modifications. Your continued use of thisisUD.com after any such modifications will constitute your: (a) acknowledgment of any modified Policy; and (b) agreement to abide and be bound by any modified Policy.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-slate-200 pt-8">
                <h2 className="text-xl font-bold text-primary">{section.title}</h2>
                <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-sm border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-700">
            Questions about this policy can be sent to{' '}
            <Link href="mailto:ap-idea@buffalo.edu" className="font-bold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-secondary hover:decoration-secondary">
              ap-idea@buffalo.edu
            </Link>
            .
          </div>
        </article>
      </section>
    </div>
  );
}
