import { motion, type Variants } from 'motion/react';
import Heading from './heading';
import Container from './container';
import { Pricing1 } from '@/components/pricing/pricing-1';

const plans = [
  {
    id: 'starter',
    title: 'Starter',
    description: 'Perfect for individuals and hobbyists just getting started with AI generation.',
    price: '$0',
    priceSuffix: '/ month',
    features: [
      { text: '10,000 AI words per month' },
      { text: 'Up to 5 active projects' },
      { text: 'Access to basic templates' },
      { text: 'Community forum support' },
    ],
    buttonText: 'Free',
    isPopular: false,
  },
  {
    id: 'creator',
    title: 'Creator',
    description: 'Designed for content creators and professionals scaling their output.',
    price: '$29',
    priceSuffix: '/ month',
    features: [
      { text: '100,000 AI words per month' },
      { text: 'Unlimited active projects' },
      { text: 'Advanced premium templates' },
      { text: 'Custom brand voice training' },
      { text: 'Priority email support' },
      { text: 'Up to 5 team members' },
    ],
    buttonText: '$29',
    isPopular: true,
  },
  {
    id: 'agency',
    title: 'Agency',
    description: 'For established businesses and agencies needing maximum power.',
    price: '$199',
    priceSuffix: '/ month',
    features: [
      { text: 'Unlimited AI word generation' },
      { text: 'White-labeled client reports' },
      { text: 'Full API access & documentation' },
      { text: 'Dedicated account manager' },
      { text: 'Unlimited team members' },
      { text: 'Custom team onboarding' },
    ],
    buttonText: '$199',
    isPopular: false,
  },
];

export default function Pricing() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.2, 0, 0, 1] },
    },
  };

  return (
    <section className="bg-[#101010] relative overflow-hidden py-24 md:py-32 font-mono">
      {/* Decorative Technical Borders */}
      <div className="hidden lg:block absolute top-0 left-0 w-full border-t border-white/5" />

      <Container className="relative z-10 mx-auto">
        <motion.div
          className="mb-16 flex flex-col items-start text-left md:items-center md:text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.div
            variants={itemVariants}
            className="text-primary mb-8 inline-flex items-center text-xs font-bold tracking-widest uppercase"
          >
            <span className="mr-3 opacity-70">{'//'}</span>
            PRICING
          </motion.div>
          <motion.div variants={itemVariants}>
            <Heading
              as="h2"
              variant="big"
              className="text-foreground font-sans text-balance"
            >
              Simple, <span className="text-primary">transparent</span> pricing
            </Heading>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-sm text-pretty text-white/50 uppercase tracking-widest"
          >
            Choose the plan that fits your workflow.
            <br className="mt-2 block md:hidden" /> Upgrade or downgrade anytime.
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <Pricing1 plans={plans} className="px-0 md:px-0 py-0" />
        </motion.div>
      </Container>
    </section>
  );
}
