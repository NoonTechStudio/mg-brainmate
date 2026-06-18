export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export interface ExtraField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface SampleLead {
  name: string;
  phone: string;
  email?: string;
  category: string;
  status: string;
  notes?: string;
  estimatedValue?: number;
  followUpDate?: string;
  source?: string;
  customFields?: Record<string, string>;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  categories: string[];
  statuses: StatusConfig[];
  extraFields: ExtraField[];
  sources: string[];
  sampleLeads: SampleLead[];
}

const d = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

export const industryTemplates: Record<string, IndustryTemplate> = {
  travel: {
    id: 'travel',
    name: 'Travel Agency',
    icon: '✈️',
    description: 'Hajj, Umrah, Visa, Tours & Holidays',
    categories: ['Umrah Package', 'Hajj Package', 'Visa Services', 'Tour Package', 'Hotel Booking', 'Flight Booking', 'Honeymoon Package'],
    statuses: [
      { label: 'New Inquiry', color: '#fff', bgColor: '#6366F1' },
      { label: 'Quoted', color: '#fff', bgColor: '#F59E0B' },
      { label: 'Documents Pending', color: '#fff', bgColor: '#EF4444' },
      { label: 'Confirmed', color: '#fff', bgColor: '#3B82F6' },
      { label: 'Booked', color: '#fff', bgColor: '#10B981' },
      { label: 'Departed', color: '#fff', bgColor: '#7C3AED' },
      { label: 'Cancelled', color: '#fff', bgColor: '#6B7280' },
    ],
    extraFields: [
      { name: 'travelDate', label: 'Travel Date', type: 'date' },
      { name: 'passengers', label: 'Passengers Count', type: 'number', placeholder: '2' },
      { name: 'destination', label: 'Destination', type: 'text', placeholder: 'Mecca, Dubai, Istanbul...' },
    ],
    sources: ['WhatsApp', 'Instagram', 'Facebook', 'Google', 'Walk-in', 'Referral', 'Phone Call'],
    sampleLeads: [
      { name: 'Ahmed Khan', phone: '+91 98765 43210', email: 'ahmed@email.com', category: 'Umrah Package', status: 'Quoted', notes: 'Family of 4. 15-day Umrah package for Ramadan. Budget around 1.5L.', estimatedValue: 150000, followUpDate: d(1), source: 'WhatsApp', customFields: { destination: 'Mecca & Madina', passengers: '4', travelDate: d(90) } },
      { name: 'Fatima Begum', phone: '+91 87654 32109', category: 'Hajj Package', status: 'New Inquiry', notes: 'Hajj 2026 inquiry. First time, needs full guidance on documentation.', estimatedValue: 300000, followUpDate: d(7), source: 'Phone Call', customFields: { destination: 'Mecca', passengers: '2' } },
      { name: 'Ravi Sharma', phone: '+91 76543 21098', category: 'Tour Package', status: 'Booked', notes: 'Dubai trip booked. Full payment received. Departure confirmed.', estimatedValue: 85000, source: 'Instagram', customFields: { destination: 'Dubai', passengers: '2', travelDate: d(30) } },
      { name: 'Priya Patel', phone: '+91 65432 10987', email: 'priya@gmail.com', category: 'Visa Services', status: 'Documents Pending', notes: 'UK tourist visa. Waiting for bank statement and invitation letter.', estimatedValue: 12000, followUpDate: d(-1), source: 'Google', customFields: { destination: 'United Kingdom', passengers: '1' } },
      { name: 'Mohammad Ali', phone: '+91 54321 09876', category: 'Umrah Package', status: 'Confirmed', notes: 'Group of 6. Economy package selected. Advance received.', estimatedValue: 180000, source: 'Referral', customFields: { destination: 'Mecca & Madina', passengers: '6', travelDate: d(45) } },
      { name: 'Sunita Verma', phone: '+91 43210 98765', category: 'Honeymoon Package', status: 'Quoted', notes: 'Maldives honeymoon. 5 nights. Wants water villa.', estimatedValue: 200000, followUpDate: d(2), source: 'Instagram', customFields: { destination: 'Maldives', passengers: '2', travelDate: d(60) } },
      { name: 'Abdul Rasheed', phone: '+91 32109 87654', category: 'Flight Booking', status: 'Booked', notes: 'Return ticket to London. Business class preferred.', estimatedValue: 95000, source: 'Walk-in', customFields: { destination: 'London', passengers: '1', travelDate: d(20) } },
      { name: 'Kavya Reddy', phone: '+91 21098 76543', category: 'Tour Package', status: 'New Inquiry', notes: 'Thailand tour for 7 nights. Group of 8 friends.', estimatedValue: 320000, followUpDate: d(3), source: 'Facebook', customFields: { destination: 'Thailand', passengers: '8' } },
    ],
  },

  realestate: {
    id: 'realestate',
    name: 'Real Estate',
    icon: '🏠',
    description: 'Property inquiries, site visits & deals',
    categories: ['2BHK Purchase', '3BHK Purchase', 'Villa / House', 'Commercial Property', 'Plot / Land', 'Rental', 'Property Sale'],
    statuses: [
      { label: 'New Inquiry', color: '#fff', bgColor: '#6366F1' },
      { label: 'Site Visit Scheduled', color: '#fff', bgColor: '#F59E0B' },
      { label: 'Site Visited', color: '#fff', bgColor: '#3B82F6' },
      { label: 'Negotiation', color: '#fff', bgColor: '#F97316' },
      { label: 'Deal Closed', color: '#fff', bgColor: '#10B981' },
      { label: 'Not Interested', color: '#fff', bgColor: '#6B7280' },
    ],
    extraFields: [
      { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Apartment', 'Villa', 'Plot', 'Commercial', 'Row House', 'Penthouse'] },
      { name: 'budget', label: 'Budget Range', type: 'text', placeholder: '50L – 80L' },
      { name: 'preferredArea', label: 'Preferred Location', type: 'text', placeholder: 'Bandra, Whitefield...' },
      { name: 'squareFeet', label: 'Area (sq ft)', type: 'number', placeholder: '1200' },
    ],
    sources: ['99acres', 'MagicBricks', 'Housing.com', 'Instagram', 'Facebook', 'Referral', 'Banner/Hoarding', 'Walk-in'],
    sampleLeads: [
      { name: 'Rajesh Gupta', phone: '+91 98123 45678', email: 'rajesh@email.com', category: '2BHK Purchase', status: 'Site Visit Scheduled', notes: 'Looking for 2BHK in Andheri West. Budget 1.2 Cr. Needs possession in 6 months.', estimatedValue: 12000000, followUpDate: d(1), source: '99acres', customFields: { propertyType: 'Apartment', budget: '1Cr – 1.3Cr', preferredArea: 'Andheri West', squareFeet: '850' } },
      { name: 'Meena Krishnan', phone: '+91 87234 56789', category: '3BHK Purchase', status: 'Negotiation', notes: 'Very interested in Tower B Floor 12. Asking for 5L discount. Counter offered 2L.', estimatedValue: 18500000, followUpDate: d(1), source: 'MagicBricks', customFields: { propertyType: 'Apartment', budget: '1.7Cr – 2Cr', preferredArea: 'Powai', squareFeet: '1250' } },
      { name: 'Suresh Nair', phone: '+91 76345 67890', category: 'Villa / House', status: 'New Inquiry', notes: 'Looking for villa in gated community. Budget 3.5Cr. Self-use.', estimatedValue: 35000000, followUpDate: d(7), source: 'Instagram', customFields: { propertyType: 'Villa', budget: '3Cr – 4Cr', preferredArea: 'Jubilee Hills', squareFeet: '3000' } },
      { name: 'Anjali Desai', phone: '+91 65456 78901', email: 'anjali@gmail.com', category: 'Rental', status: 'Site Visited', notes: 'Looking for 2BHK rental. Budget 35k/month.', estimatedValue: 35000, followUpDate: d(1), source: 'Housing.com', customFields: { propertyType: 'Apartment', budget: '30k – 40k/month', preferredArea: 'Whitefield', squareFeet: '900' } },
      { name: 'Vikram Malhotra', phone: '+91 54567 89012', category: 'Property Sale', status: 'New Inquiry', notes: 'Wants to sell his 3BHK in Bandra. Asking 2.8Cr. Ready for negotiation.', estimatedValue: 28000000, source: 'Referral', customFields: { propertyType: 'Apartment', preferredArea: 'Bandra West', squareFeet: '1400' } },
      { name: 'Lakshmi Iyer', phone: '+91 43678 90123', category: '2BHK Purchase', status: 'Deal Closed', notes: 'Deal done! 2BHK in Tower A. Full payment. Registration next week.', estimatedValue: 9500000, source: 'Facebook', customFields: { propertyType: 'Apartment', preferredArea: 'Thane', squareFeet: '780' } },
      { name: 'Deepak Soni', phone: '+91 32789 01234', category: 'Plot / Land', status: 'New Inquiry', notes: '200 sq yd plot in developing area. Planning to build.', estimatedValue: 5000000, followUpDate: d(7), source: 'Banner/Hoarding', customFields: { propertyType: 'Plot', budget: '40L – 60L', preferredArea: 'Sector 56, Gurgaon' } },
    ],
  },

  education: {
    id: 'education',
    name: 'Education',
    icon: '📚',
    description: 'Student inquiries, admissions & follow-ups',
    categories: ['Engineering', 'MBA / Management', 'Medical', 'Computer Science', 'Arts & Commerce', 'Certificate Course', 'Coaching Classes'],
    statuses: [
      { label: 'Inquiry Received', color: '#fff', bgColor: '#6366F1' },
      { label: 'Counseling Scheduled', color: '#fff', bgColor: '#F59E0B' },
      { label: 'Counseled', color: '#fff', bgColor: '#3B82F6' },
      { label: 'Form Submitted', color: '#fff', bgColor: '#F97316' },
      { label: 'Admission Confirmed', color: '#fff', bgColor: '#10B981' },
      { label: 'Not Interested', color: '#fff', bgColor: '#6B7280' },
    ],
    extraFields: [
      { name: 'courseInterested', label: 'Course Interested', type: 'text', placeholder: 'B.Tech Computer Science' },
      { name: 'educationLevel', label: 'Current Education', type: 'select', options: ['10th Pass', '12th Pass', 'Graduation', 'Post Graduation', 'Working Professional'] },
      { name: 'preferredStartDate', label: 'Preferred Start Date', type: 'date' },
      { name: 'parentName', label: 'Parent / Guardian Name', type: 'text', placeholder: 'Father / Mother name' },
    ],
    sources: ['Google Ads', 'Just Dial', 'Instagram', 'Education Fair', 'Referral', 'School Visit', 'Walk-in', 'Phone Call'],
    sampleLeads: [
      { name: 'Arjun Mehta', phone: '+91 98234 56781', email: 'arjun@gmail.com', category: 'Engineering', status: 'Counseling Scheduled', notes: 'B.Tech CS. JEE 95 percentile. Very keen. Father is an engineer.', estimatedValue: 400000, followUpDate: d(1), source: 'Google Ads', customFields: { courseInterested: 'B.Tech Computer Science', educationLevel: '12th Pass', parentName: 'Suresh Mehta' } },
      { name: 'Priyanka Joshi', phone: '+91 87345 67892', category: 'MBA / Management', status: 'Inquiry Received', notes: 'Working professional, 3 years exp. Executive MBA. Weekends only.', estimatedValue: 600000, followUpDate: d(7), source: 'Instagram', customFields: { courseInterested: 'Executive MBA', educationLevel: 'Working Professional' } },
      { name: 'Karan Singh', phone: '+91 76456 78903', category: 'Computer Science', status: 'Admission Confirmed', notes: 'Admission done! Fees received. Starting July batch.', estimatedValue: 350000, source: 'Referral', customFields: { courseInterested: 'BCA', educationLevel: '12th Pass', preferredStartDate: d(75) } },
      { name: 'Ananya Roy', phone: '+91 65567 89014', category: 'Coaching Classes', status: 'Counseled', notes: 'NEET aspirant. 2-year coaching. Parents meeting done. Decision pending.', estimatedValue: 180000, followUpDate: d(1), source: 'Education Fair', customFields: { courseInterested: 'NEET Coaching', educationLevel: '10th Pass', parentName: 'Dr. Tapan Roy' } },
      { name: 'Rahul Yadav', phone: '+91 54678 90125', category: 'Arts & Commerce', status: 'Form Submitted', notes: 'BCom form submitted. Waiting for merit list.', estimatedValue: 250000, source: 'Walk-in', customFields: { courseInterested: 'B.Com (Hons)', educationLevel: '12th Pass' } },
      { name: 'Deepika Nair', phone: '+91 43789 01236', email: 'deepika@email.com', category: 'Certificate Course', status: 'Inquiry Received', notes: 'Short-term digital marketing course. Budget 30k.', estimatedValue: 30000, followUpDate: d(7), source: 'Google Ads', customFields: { courseInterested: 'Digital Marketing Certificate', educationLevel: 'Graduation' } },
      { name: 'Amit Kumar', phone: '+91 32890 12347', category: 'Engineering', status: 'Counseling Scheduled', notes: 'Lateral entry B.Tech. Diploma in EE. Strong academics.', estimatedValue: 300000, followUpDate: d(1), source: 'Phone Call', customFields: { courseInterested: 'B.Tech Electrical (Lateral)', educationLevel: 'Graduation' } },
    ],
  },

  wedding: {
    id: 'wedding',
    name: 'Wedding Planning',
    icon: '💍',
    description: 'Venues, vendors & complete event management',
    categories: ['Full Wedding Package', 'Venue Booking', 'Catering', 'Decoration', 'Photography / Video', 'Mehendi & Makeup', 'Invitation Cards'],
    statuses: [
      { label: 'Initial Inquiry', color: '#fff', bgColor: '#6366F1' },
      { label: 'Meeting Scheduled', color: '#fff', bgColor: '#F59E0B' },
      { label: 'Proposal Sent', color: '#fff', bgColor: '#EC4899' },
      { label: 'Negotiation', color: '#fff', bgColor: '#F97316' },
      { label: 'Booked', color: '#fff', bgColor: '#10B981' },
      { label: 'Event Done', color: '#fff', bgColor: '#7C3AED' },
      { label: 'Cancelled', color: '#fff', bgColor: '#6B7280' },
    ],
    extraFields: [
      { name: 'weddingDate', label: 'Wedding Date', type: 'date' },
      { name: 'guestCount', label: 'Guest Count (approx)', type: 'number', placeholder: '500' },
      { name: 'venueType', label: 'Venue Type', type: 'select', options: ['Banquet Hall', 'Outdoor / Lawn', 'Hotel', 'Farm House', 'Beach', 'Destination Wedding'] },
      { name: 'budgetRange', label: 'Budget Range', type: 'text', placeholder: '10L – 25L' },
    ],
    sources: ['Instagram', 'WeddingWire', 'Referral', 'JustDial', 'Facebook', 'Google', 'Wedding Fair'],
    sampleLeads: [
      { name: 'Rahul & Pooja', phone: '+91 98345 67812', email: 'rahulpooja@gmail.com', category: 'Full Wedding Package', status: 'Meeting Scheduled', notes: 'Grand wedding. 600-700 guests. 3-day event. Parents very specific about decor.', estimatedValue: 2500000, followUpDate: d(1), source: 'Instagram', customFields: { weddingDate: d(220), guestCount: '650', venueType: 'Hotel', budgetRange: '20L – 30L' } },
      { name: 'Aditya Kapoor', phone: '+91 87456 78923', category: 'Venue Booking', status: 'Proposal Sent', notes: 'Farm house for 400 people. December dates.', estimatedValue: 600000, followUpDate: d(1), source: 'WeddingWire', customFields: { weddingDate: d(240), guestCount: '400', venueType: 'Farm House', budgetRange: '5L – 8L' } },
      { name: 'Sneha & Vishal', phone: '+91 76567 89034', category: 'Full Wedding Package', status: 'Booked', notes: 'Booked! 50% advance received. Intimate wedding, 150 guests.', estimatedValue: 850000, source: 'Referral', customFields: { weddingDate: d(110), guestCount: '150', venueType: 'Outdoor / Lawn', budgetRange: '7L – 10L' } },
      { name: 'Neha Sharma', phone: '+91 65678 90145', category: 'Photography / Video', status: 'Negotiation', notes: 'Candid photography + video. 2-day event. Comparing vendors.', estimatedValue: 150000, followUpDate: d(1), source: 'Instagram', customFields: { weddingDate: d(165), guestCount: '300', venueType: 'Banquet Hall' } },
      { name: 'Ritesh Agarwal', phone: '+91 54789 01256', email: 'ritesh@biz.com', category: 'Catering', status: 'Initial Inquiry', notes: '800 guests. North Indian + Continental. Quality is priority.', estimatedValue: 800000, followUpDate: d(7), source: 'Google', customFields: { weddingDate: d(150), guestCount: '800', budgetRange: '7L – 10L' } },
      { name: 'Divya & Sameer', phone: '+91 43890 12367', category: 'Full Wedding Package', status: 'Negotiation', notes: 'Destination wedding in Goa. 200 guests. Need full vendor coordination.', estimatedValue: 3000000, followUpDate: d(1), source: 'Instagram', customFields: { weddingDate: d(270), guestCount: '200', venueType: 'Destination Wedding', budgetRange: '25L – 35L' } },
    ],
  },

  insurance: {
    id: 'insurance',
    name: 'Insurance / Finance',
    icon: '💼',
    description: 'Policy inquiries, claims & renewals',
    categories: ['Life Insurance', 'Health Insurance', 'Motor Insurance', 'Home Insurance', 'Investment / MF', 'Loan', 'Credit Card'],
    statuses: [
      { label: 'New Lead', color: '#fff', bgColor: '#6366F1' },
      { label: 'Contacted', color: '#fff', bgColor: '#F59E0B' },
      { label: 'Presentation Done', color: '#fff', bgColor: '#3B82F6' },
      { label: 'Proposal Sent', color: '#fff', bgColor: '#F97316' },
      { label: 'Policy Issued', color: '#fff', bgColor: '#10B981' },
      { label: 'Renewal Due', color: '#fff', bgColor: '#EC4899' },
      { label: 'Not Interested', color: '#fff', bgColor: '#6B7280' },
    ],
    extraFields: [
      { name: 'policyType', label: 'Policy / Product Type', type: 'text', placeholder: 'Term Plan, Health Floater...' },
      { name: 'currentProvider', label: 'Current Provider', type: 'text', placeholder: 'LIC, Star Health...' },
      { name: 'renewalDate', label: 'Renewal Date', type: 'date' },
      { name: 'sumAssured', label: 'Sum Assured / Coverage', type: 'text', placeholder: '50 Lakhs' },
    ],
    sources: ['Referral', 'Cold Call', 'Online Portal', 'Bank Partnership', 'Walk-in', 'Social Media', 'Corporate Tie-up'],
    sampleLeads: [
      { name: 'Vijay Sharma', phone: '+91 98456 78923', email: 'vijay@company.com', category: 'Life Insurance', status: 'Presentation Done', notes: '35 yr, IT professional. 1 Cr term plan. Comparing HDFC and ICICI.', estimatedValue: 24000, followUpDate: d(1), source: 'Referral', customFields: { policyType: 'Term Insurance 1 Cr', currentProvider: 'None', sumAssured: '1 Crore' } },
      { name: 'Dr. Anita Rao', phone: '+91 87567 89034', category: 'Health Insurance', status: 'Policy Issued', notes: 'Family floater plan issued. 10L coverage. Premium paid.', estimatedValue: 35000, source: 'Walk-in', customFields: { policyType: 'Family Floater Health', renewalDate: d(365), sumAssured: '10 Lakhs' } },
      { name: 'Suresh Motors', phone: '+91 76678 90145', category: 'Motor Insurance', status: 'Renewal Due', notes: 'Fleet of 5 commercial vehicles. Renewal due next month. Bulk discount possible.', estimatedValue: 75000, followUpDate: d(1), source: 'Corporate Tie-up', customFields: { policyType: 'Commercial Vehicle Fleet', currentProvider: 'National Insurance', renewalDate: d(7), sumAssured: '15L per vehicle' } },
      { name: 'Ramesh Patil', phone: '+91 65789 01256', category: 'Investment / MF', status: 'Contacted', notes: '10k/month SIP. Moderate risk. Retirement planning.', estimatedValue: 120000, followUpDate: d(7), source: 'Social Media', customFields: { policyType: 'SIP – Equity & Debt Mix', currentProvider: 'None' } },
      { name: 'Kavita Jain', phone: '+91 54890 12367', email: 'kavita@home.com', category: 'Home Insurance', status: 'New Lead', notes: 'New home purchase. Bank suggested home insurance. 50L property.', estimatedValue: 8000, followUpDate: d(7), source: 'Bank Partnership', customFields: { policyType: 'Home Structure + Content', currentProvider: 'None', sumAssured: '50 Lakhs' } },
      { name: 'Arun Thakur', phone: '+91 43901 23478', category: 'Life Insurance', status: 'Proposal Sent', notes: 'ULIP plan. 2L/year premium. Decision expected this week.', estimatedValue: 200000, followUpDate: d(1), source: 'Referral', customFields: { policyType: 'ULIP – Growth Plan', currentProvider: 'None', sumAssured: '20 Lakhs' } },
    ],
  },

  other: {
    id: 'other',
    name: 'Other Business',
    icon: '📱',
    description: 'Customizable for any business type',
    categories: ['Service Inquiry', 'Product Inquiry', 'Consultation', 'Repair / Maintenance', 'Bulk Order', 'Partnership', 'Other'],
    statuses: [
      { label: 'New Lead', color: '#fff', bgColor: '#6366F1' },
      { label: 'Contacted', color: '#fff', bgColor: '#F59E0B' },
      { label: 'Follow-up', color: '#fff', bgColor: '#3B82F6' },
      { label: 'Negotiation', color: '#fff', bgColor: '#F97316' },
      { label: 'Won', color: '#fff', bgColor: '#10B981' },
      { label: 'Lost', color: '#fff', bgColor: '#EF4444' },
    ],
    extraFields: [],
    sources: ['WhatsApp', 'Instagram', 'Facebook', 'Google', 'Walk-in', 'Referral', 'Phone Call', 'Website'],
    sampleLeads: [
      { name: 'Raju Enterprises', phone: '+91 98567 89034', category: 'Bulk Order', status: 'Negotiation', notes: '500 custom printed t-shirts. Corporate order. Timeline 2 weeks.', estimatedValue: 75000, followUpDate: d(1), source: 'WhatsApp' },
      { name: 'Preethi Fashions', phone: '+91 87678 90145', email: 'preethi@fashions.com', category: 'Service Inquiry', status: 'Follow-up', notes: 'Monthly tailoring service for boutique. 50-60 pieces/month.', estimatedValue: 25000, followUpDate: d(1), source: 'Instagram' },
      { name: 'Tech Solutions Pvt', phone: '+91 76789 01256', category: 'Consultation', status: 'Won', notes: 'Annual maintenance contract signed. Payment received.', estimatedValue: 120000, source: 'Referral' },
      { name: 'Mohan Bakery', phone: '+91 65890 12367', category: 'Product Inquiry', status: 'New Lead', notes: 'Custom cake boxes. MOQ 500 units. Good prospect.', estimatedValue: 15000, followUpDate: d(7), source: 'Google' },
      { name: 'Rajani Clinic', phone: '+91 54901 23478', category: 'Repair / Maintenance', status: 'Contacted', notes: 'AC service contract. 8 units. Quarterly maintenance.', estimatedValue: 32000, followUpDate: d(7), source: 'Walk-in' },
    ],
  },
};

export function getTemplate(id: string): IndustryTemplate {
  return industryTemplates[id] || industryTemplates.other;
}

export const templateList = Object.values(industryTemplates);
