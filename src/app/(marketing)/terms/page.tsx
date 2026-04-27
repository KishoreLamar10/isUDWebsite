import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use - isUD',
  description: 'Terms of Use for thisisUD.com.',
};

const intro = [
  'Welcome to thisisUD.com. Please read these terms of use carefully because they describe your rights and responsibilities and constitute a legally binding agreement between you and thisisUD.com regarding your use of the thisisUD.com web site.',
  'These are official terms and conditions (Terms of Use) and form a legally binding agreement between you and the University at Buffalo Center for Inclusive Design and Environmental Access (IDEA, thisisUD.com, thisisUD.org, we, us, or our) regarding your use of the thisisUD.com web site located at thisisUD.com, as well as the associated web pages, features, and functions made available by thisisUD.com.',
  'YOU AGREE TO READ THESE TERMS OF USE CAREFULLY EACH TIME YOU ACCESS THE isUD.com site.',
  'The thisisUD.com site is offered and made available only to users 18 years of age or older, users who have reached the age of majority in the jurisdiction in which they live or reside, or users who have a parent or guardian permission to view the site. If your use of the thisisUD.com site is prohibited or restricted by applicable law, or if you do not agree with all terms and conditions contained in these Terms of Use, please discontinue using the site immediately.',
  'When we use the term "Agreement," we mean these Terms of Use, any additional terms and conditions that apply to features, functions, and services made available through thisisUD.com, and our Privacy Policy, which is incorporated by reference.',
  'The words "use" or "using" mean any direct or indirect access, interaction, display, viewing, printing, copying, receiving data from, or other use of the thisisUD.com site or any function, service, or feature of the site.',
  'These Terms of Use are effective as of July 1, 2016. We reserve the right to change the terms of this Agreement at any time, with or without notice. Once posted on thisisUD.com, changes become effective immediately.',
];

const sections = [
  {
    title: '1. Ownership And Proprietary Rights',
    paragraphs: [
      'The thisisUD.com site, including all content, media, materials, software, code, design, text, images, photographs, illustrations, audio and video material, artwork, graphic material, articles, databases, proprietary information, writings, recordings, visual works, documentation, packaging, and all legally protectable elements of the site, including the selection, sequence, look and feel, arrangement, derivative works, translations, adaptations, and variations, is referred to as "Content."',
      'The Content is the property of thisisUD.com and/or its affiliates, advertisers, licensors, suppliers, service providers, promotional partners, and sponsors. All Content is legally protected under U.S. Federal and State laws, applicable foreign laws, regulations, and treaties.',
      'The brands, names, logos, trade names, trademarks, service marks, and other distinctive identifications on or of the thisisUD.com site, including IDEA and the stylized thisisUD.com logo, are proprietary trademarks and intellectual property of thisisUD.com. You may not use these Marks without express prior written consent.',
    ],
  },
  {
    title: '2. License And Site Access',
    paragraphs: [
      'thisisUD.com authorizes you to access content and grants you a limited right and license to use the site solely for non-commercial, non-exclusive, non-assignable, non-sublicensable, non-transferable personal use.',
      'You may download one single hard copy of content for non-commercial, personal use only. You must not alter, delete, or conceal copyright or legal notices. Unless expressly authorized in writing, you may not reproduce, modify, create derivative works from, display, perform, publish, distribute, sell, upload, transmit, disseminate, broadcast, circulate, or otherwise use any content.',
      'This license excludes resale or commercial use, collection and use of listings or descriptions, derivative use, downloading or copying membership information, data mining, web scraping, robots, or similar data gathering tools. Unauthorized use terminates the permission or license granted by thisisUD.com.',
      'As an express condition of use, you warrant that you will not use the site for any unlawful purpose or any purpose prohibited by this Agreement. Violations may subject you to civil liability, criminal prosecution, or both.',
    ],
  },
  {
    title: '3. Notice And Procedure For Making Claims Of Copyright Infringement',
    paragraphs: [
      'We respect the intellectual property of others and ask you to do the same. If you believe copyright, trademark, or other property rights have been infringed, the rights owner or authorized representative should notify our Designated Agent immediately.',
      'A notification should include a physical or electronic signature, identification of the rights claimed to have been infringed, contact information, identification of the material claimed to be infringing, a good faith statement that the use is not authorized, and a statement that the information is accurate under penalty of perjury.',
      'Designated Agent for Claimed Infringement: Center for Inclusive Design and Environmental Access, University at Buffalo School of Architecture and Planning, 3435 Main Street, Hayes Hall, Buffalo, NY 14214-8030.',
      'Email: ap-idea@buffalo.edu.',
      'On notice, we will act expeditiously to review and, if necessary, remove content that infringes the copyright rights of others and disable access for repeat infringers.',
    ],
  },
  {
    title: '4. Accuracy Of Information & Product Descriptions',
    paragraphs: [
      'We try to assure the accuracy of all information displayed on thisisUD.com, but information may contain errors, inaccuracies, or omissions. Despite our best efforts, some information may contain errors. We are not liable for harm caused by or related to such errors.',
    ],
  },
  {
    title: '5. Hyperlinks To Third Party Sites',
    paragraphs: [
      'The thisisUD.com site may provide links to third party web sites and resources as a convenience. These links are not endorsements of third party content, advertising, business practices, or privacy policies.',
      'Third party sites may have different privacy policies and business practices. thisisUD.com, IDEA, affiliates, successors, assigns, officers, directors, shareholders, employees, representatives, agents, and service providers are not responsible for damage or loss caused by use of or reliance on linked third party sites.',
      'Email is an important communication channel. Email users shall not mask their identity by using a false name or another person name or account. We may use your email address and email content for administrative and correspondence purposes and to send requested information.',
      'Any non-personal content you provide by email, including feedback, data, questions, comments, suggestions, plans, or ideas, is deemed non-confidential and may be reproduced, used, disclosed, and distributed without restriction.',
    ],
  },
  {
    title: '6. Rules Of Conduct',
    paragraphs: [
      'Your use of the thisisUD.com site is subject to all applicable local, state, national laws and regulations and, in some cases, international treaties. You are responsible for all activities, acts, and omissions that occur in, from, through, or under your User ID.',
      'You shall not use the site in a manner that is libelous, defamatory, indecent, vulgar, obscene, harmful, harassing, threatening, hateful, discriminatory, abusive, impersonating, damaging to goodwill, spam-related, commercial without permission, malicious, unlawful, infringing, unauthorized, disruptive, or invasive of another person information or rights.',
      'You agree to indemnify, defend, and hold thisisUD.com owners, licensees, affiliates, officers, directors, employees, agents, licensors, representatives, advertisers, service providers, and suppliers harmless from claims, actions, losses, expenses, damages, and costs resulting from your breach of this Agreement, your postings, your submitted content, or unauthorized use of Content.',
    ],
  },
  {
    title: '7. Disclaimer And Limitations Of Liability',
    paragraphs: [
      'The thisisUD.com site and all materials and products thereon are made available on an "as is" and "as available" basis, without representation, warranty, guaranty, or assurance of any kind.',
      'To the fullest extent permissible by law, thisisUD.com, isUD.com owners, licensees, affiliates, successors, assigns, officers, directors, employees, agents, representatives, licensors, operational service providers, advertisers, or suppliers shall not be liable for direct or indirect loss or damage arising from use of the site or this Agreement.',
      'Your sole and exclusive remedy for any loss or damage shall be for thisisUD.com, upon written notice, to attempt to repair, correct, or replace any deficient Product, or, if not reasonably practicable, refund monies actually paid for the Product involved and terminate site use.',
    ],
  },
  {
    title: '8. Ads And Malware',
    paragraphs: [
      'We take care in creating the thisisUD.com site and work to fix technical issues when we find them. However, your personal computer may cause issues that affect your experience and are beyond our control.',
      'If you experience unusual behavior, content, or ads on the site, it may be the result of malware on your computer. Malware may include viruses, key loggers, malicious active content, rogue programs, dialers, and similar software. If you discover malware, we suggest speaking with a qualified computer technician.',
    ],
  },
  {
    title: '9. International Use',
    paragraphs: [
      'Although the thisisUD.com site may be accessible worldwide, we make no representation that materials are lawful, appropriate, or available for use outside the United States of America. Those who access the site from other locations do so on their own initiative and are responsible for local law compliance.',
    ],
  },
  {
    title: '10. Contests, Sweepstakes, Auctions And Promotions',
    paragraphs: [
      'From time to time, thisisUD.com, affiliates, operational service providers, suppliers, or advertisers may conduct promotions through the site, including auctions, contests, and sweepstakes. Each promotion may have additional terms or rules that become part of this Agreement.',
    ],
  },
  {
    title: '11. Miscellaneous Terms',
    paragraphs: [
      'These Terms of Use, our Privacy Policy, any Rules, and any additional terms and policies referenced herein contain the entire understanding and agreement between you and thisisUD.com and supersede prior inconsistent understandings.',
      'If any provision is held to be illegal, invalid, or unenforceable, the remaining provisions remain in effect and the Agreement will be deemed amended to the extent necessary to make it legal, valid, and enforceable.',
      'This Agreement and your use of the site shall be governed by the substantive laws of the State of New York, USA. You agree to exclusive jurisdiction and venue in State and Federal Courts situated in the State of New York.',
      'To the maximum extent of the law, you waive any right to a trial by jury in any action or proceeding related to this Agreement or use of the site. A printed version of this Agreement and any electronic notice shall be admissible in proceedings to the same extent as other business records.',
      'The headings are for reference only and do not affect interpretation. Where text requires, words in the singular include the plural and vice versa, and words of any gender include all genders.',
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
            {intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
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
