import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use - isUD',
  description: 'Terms of Use for thisisUD.com.',
};

const intro = [
  'Welcome to thisisUD.com. Please read these terms of use carefully because they describe your rights and responsibilities and constitute a legally binding agreement between you and thisisUD.com regarding your use of the thisisUD.com web site.',
  'These are official terms and conditions and form a legally binding agreement between you and the University at Buffalo Center for Inclusive Design and Environmental Access (IDEA, thisisUD.com, thisisUD.org, we, us, or our) regarding your use of thisisUD.com, associated web pages, features, and functions.',
  'YOU AGREE TO READ THESE TERMS OF USE CAREFULLY EACH TIME YOU ACCESS THE isUD.com site.',
  'The thisisUD.com site is offered only to users 18 years of age or older, users who have reached the age of majority in their jurisdiction, or users who have permission from a parent or guardian. If you do not agree with these Terms of Use, discontinue using the site immediately.',
  'These Terms of Use are effective as of July 1, 2016. We reserve the right to change the terms of this Agreement with or without notice. Changes become effective immediately once posted on the thisisUD.com site.',
];

const sections = [
  {
    title: '1. Ownership And Proprietary Rights',
    paragraphs: [
      'The thisisUD.com site, including all content, media, materials, software, code, design, text, images, photographs, illustrations, audio and video material, artwork, articles, databases, proprietary information, and all legally protectable elements of the site, is the property of thisisUD.com and/or its affiliates, advertisers, licensors, suppliers, service providers, promotional partners, and sponsors.',
      'All Content on the thisisUD.com site is legally protected under U.S. Federal and State laws, applicable foreign laws, regulations, and treaties. You should assume that all Content is either copyrighted property of thisisUD.com or copyrighted property of third parties unless otherwise noted.',
      'The brands, names, logos, trade names, trademarks, service marks, and other distinctive identifications on or of the thisisUD.com site, including IDEA and the stylized thisisUD.com logo, are trademarks and intellectual property of thisisUD.com. You may not use these Marks without express prior written consent.',
    ],
  },
  {
    title: '2. License And Site Access',
    paragraphs: [
      'thisisUD.com authorizes you to access content and grants you a limited license to use the site solely for non-commercial, non-exclusive, non-assignable, non-sublicensable, non-transferable personal use.',
      'You may not alter, delete, or conceal copyright or legal notices. Unless explicitly authorized in writing, you may not reproduce, modify, create derivative works from, display, perform, publish, distribute, sell, upload, transmit, broadcast, or otherwise use any content without express prior written consent.',
      'Unauthorized use terminates the permission or license granted by thisisUD.com. You warrant that you will not use the site for an unlawful purpose or any purpose prohibited by this Agreement.',
    ],
  },
  {
    title: '3. Copyright Infringement Claims',
    paragraphs: [
      'We respect the intellectual property of others and ask you to do the same. If you believe that copyright, trademark, or other property rights have been infringed, the rights owner or authorized representative should send notification to our Designated Agent.',
      'Pursuant to the Digital Millennium Copyright Act, 17 U.S.C. Section 512(c), the Designated Agent for notice of claims of infringement is: Center for Inclusive Design and Environmental Access, University at Buffalo School of Architecture and Planning, 3435 Main Street, Hayes Hall, Buffalo, NY 14214-8030.',
      'Email: ap-idea@buffalo.edu.',
    ],
  },
  {
    title: '4. Accuracy Of Information',
    paragraphs: [
      'We try to assure the accuracy of all information displayed on the thisisUD.com site, but information may contain errors, inaccuracies, or omissions. We are not liable for any harm caused by or related to such errors.',
    ],
  },
  {
    title: '5. Hyperlinks To Third Party Sites',
    paragraphs: [
      'The thisisUD.com site may provide links to third party web sites and resources as a convenience. These links are not an endorsement of the content, advertising, privacy policies, or business practices of third party sites.',
      'Third party web sites may have different privacy policies and business practices. You access third party sites at your own risk.',
    ],
  },
  {
    title: '6. Rules Of Conduct',
    paragraphs: [
      'Your use of the site is subject to all applicable laws and regulations. You shall not use the site in a manner that is defamatory, obscene, harmful, harassing, threatening, hateful, discriminatory, abusive, impersonating, damaging, spam-related, commercial without permission, malicious, unlawful, infringing, unauthorized, disruptive, or invasive of another person information or rights.',
      'You agree to indemnify, defend, and hold thisisUD.com owners, licensees, affiliates, officers, directors, employees, agents, licensors, representatives, advertisers, service providers, and suppliers harmless from claims, losses, expenses, damages, and costs resulting from your breach of this Agreement or unauthorized use of Content.',
    ],
  },
  {
    title: '7. Disclaimer And Limitations Of Liability',
    paragraphs: [
      'The thisisUD.com site and all materials and products thereon are made available on an "as is" and "as available" basis, without representation or warranty of any kind.',
      'To the fullest extent permissible by law, thisisUD.com and related parties shall not be liable for direct or indirect loss or damage arising from use of the site or this Agreement.',
    ],
  },
  {
    title: '8. Ads And Malware',
    paragraphs: [
      'We work to fix technical issues when we find them. However, your personal computer may cause issues that affect your experience and are beyond our control. If you experience unusual behavior, content, or ads, it may be the result of malware on your computer.',
    ],
  },
  {
    title: '9. International Use',
    paragraphs: [
      'Although the site may be accessible worldwide, we make no representation that materials are lawful, appropriate, or available outside the United States of America. Those who access the site from other locations are responsible for compliance with local laws.',
    ],
  },
  {
    title: '10. Promotions',
    paragraphs: [
      'From time to time, thisisUD.com or its affiliates may conduct promotions on or through the site. Each Promotion may have additional terms or rules that will be posted or otherwise made available and incorporated into this Agreement.',
    ],
  },
  {
    title: '11. Miscellaneous Terms',
    paragraphs: [
      'These Terms of Use, our Privacy Policy, and any additional terms and policies referenced herein contain the entire understanding and agreement between you and thisisUD.com.',
      'This Agreement and your use of the site shall be governed by the substantive laws of the State of New York, USA. You agree to the exclusive jurisdiction and venue of State and Federal Courts situated in the State of New York.',
      'The headings contained in this Agreement are for reference purposes only and shall not affect interpretation.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
        <article className="max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-wider text-secondary">Legal</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
            Terms of Use
          </h1>

          <div className="mt-8 space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
            {intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.title} className="border-t border-slate-200 pt-8">
                <h2 className="text-xl font-bold text-primary">{section.title}</h2>
                <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-700">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-sm border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-700">
            Questions about these terms can be sent to{' '}
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
