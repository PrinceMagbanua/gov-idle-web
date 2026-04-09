// Upgrade cost formula: (1.15 ^ upgradeIndex) * baseCost * 25
export const getUpgradeCost = (baseCost, upgradeIndex) =>
  Math.floor(baseCost * 25 * Math.pow(1.15, upgradeIndex));

// Per-unit upgrades keyed by generator id.
// Each upgrade adds +1 to that tier's modifierLevel.
// CPS formula: baseCPS * (2 ^ modifierLevel) * owned
// So every 2 upgrades = 2× CPS for that tier.
export const GENERATOR_UPGRADES = {
  barangay_tanod: [
    {
      index: 0,
      name: 'Reflective Vest Budget',
      description: 'Finally, they can be seen. Whether this is an improvement is unclear.',
    },
    {
      index: 1,
      name: 'Double-Rate Barangay Permit',
      description: 'For activities that require a permit. The rate is whatever you need it to be.',
    },
    {
      index: 2,
      name: 'CCTV (Facing the Street)',
      description: 'Installed for community safety. The footage is not shareable with the NBI.',
    },
    {
      index: 3,
      name: 'Night Differential',
      description: 'Hazard pay for being awake. Standard. Unavoidable.',
    },
    {
      index: 4,
      name: 'Allowance Increase (Pocket Difference)',
      description: 'The increase is ₱500. ₱200 reaches them. This is the system.',
    },
    {
      index: 5,
      name: 'Birthday Celebrant Protocol',
      description: 'Every birthday is a team-building event. Budget per birthday: ₱15,000.',
    },
    {
      index: 6,
      name: 'Sports Fest Allocation',
      description: 'Annual. Mandatory. Budget mysteriously doubles year over year.',
    },
    {
      index: 7,
      name: 'Community Seminar (Tagaytay)',
      description: 'A seminar about community organizing. Held in Tagaytay. Catered.',
    },
  ],

  ghost_employee: [
    {
      index: 0,
      name: 'Complete Attendance Records',
      description: 'Present every day. For three years. Simultaneously at two agencies.',
    },
    {
      index: 1,
      name: 'Direct Salary Deposit',
      description: 'ATM card registered to your personal account. For safekeeping.',
    },
    {
      index: 2,
      name: 'Hazard Pay Classification',
      description: 'The office is classified as a hazard zone. It is not. The pay is.',
    },
    {
      index: 3,
      name: 'Plantilla Position',
      description: 'Permanent. Irremovable. The position was created for this name.',
    },
    {
      index: 4,
      name: 'Performance Bonus (Excellent)',
      description: 'Outstanding rating. Peer-reviewed by the supervisor who benefits.',
    },
    {
      index: 5,
      name: 'PERA Allowance',
      description: 'Personnel Economic Relief Allowance. Relieving you of administrative complexity.',
    },
    {
      index: 6,
      name: '14th Month Pay',
      description: 'One beyond the legal requirement. Because you care.',
    },
    {
      index: 7,
      name: 'Early Retirement at 45',
      description: 'Full benefits. Immediate pension. The paperwork is clean.',
    },
  ],

  overpriced_consultant: [
    {
      index: 0,
      name: 'Professional Fee Rate Card',
      description: '₱150,000 per day. Standard industry rates. The industry sets its own rates.',
    },
    {
      index: 1,
      name: 'Terms of Reference (Pre-written)',
      description: 'The TOR was written to exactly match their qualifications. Coincidentally.',
    },
    {
      index: 2,
      name: 'Sole Source Justification',
      description: 'Emergency procurement. The emergency began two years ago.',
    },
    {
      index: 3,
      name: 'Executive Engagement Retainer',
      description: "Monthly. For 'strategic advice.' The advice is: keep paying the retainer.",
    },
    {
      index: 4,
      name: 'Deliverable Extension',
      description: 'The 60-day contract has been extended 7 times. Total duration: 3 years.',
    },
    {
      index: 5,
      name: 'VAT Exemption (Specialist Status)',
      description: 'Classified as a specialist. The classification was self-certified.',
    },
    {
      index: 6,
      name: 'Success Fee Arrangement',
      description: "Paid on 'completion of deliverables.' Completion is defined by them.",
    },
    {
      index: 7,
      name: 'Intellectual Property Clause',
      description: 'The report belongs to them. The government paid for it. This is normal.',
    },
  ],

  deputy_asst_undersecretary: [
    {
      index: 0,
      name: 'Executive Vehicle Assignment',
      description: "Government plate. Personal use authorized for 'official functions.' Weekends included.",
    },
    {
      index: 1,
      name: 'Personal Staff Complement',
      description: 'Three staff. Two are relatives. One is the driver\'s son.',
    },
    {
      index: 2,
      name: 'Special Assignment Allowance',
      description: 'For special assignments. The assignment is being them.',
    },
    {
      index: 3,
      name: 'Travel Order Streamlining',
      description: "Domestic trips approved in advance. For 'coordination.' In Palawan.",
    },
    {
      index: 4,
      name: 'Inter-Agency Liaison Role',
      description: 'Officially a liaison to six agencies. None of them have received a memo.',
    },
    {
      index: 5,
      name: 'Committee Chair Appointment',
      description: 'Chairs the Technical Working Group on Optimizing the Technical Working Group.',
    },
    {
      index: 6,
      name: 'Protocol Upgrade',
      description: 'Now has a receiving line. An executive assistant announces visitors.',
    },
    {
      index: 7,
      name: 'Concurrent Designation',
      description: 'Concurrent officer-in-charge of three offices. Salary differential: included.',
    },
  ],

  bureau_director: [
    {
      index: 0,
      name: 'SALN Optimization',
      description: "Assets reorganized across family members for 'estate planning purposes.'",
    },
    {
      index: 1,
      name: 'Farm Compound Development',
      description: 'The farm now has a function hall, three fishponds, and high-speed internet. For farming.',
    },
    {
      index: 2,
      name: "Fleet Expansion (Spouse's Name)",
      description: "Three vehicles. None on the director's SALN. All at the director's address.",
    },
    {
      index: 3,
      name: 'VIP Airport Lane Access',
      description: 'Courtesy lane. MIAA clearance. No waiting. No scanning.',
    },
    {
      index: 4,
      name: 'Business Interest Disclosure (Redacted)',
      description: 'Filed. Redacted per executive privilege. Trust the process.',
    },
    {
      index: 5,
      name: 'Inter-Agency Goodwill Fund',
      description: "For 'coordination activities.' Disbursed in cash. No receipt required.",
    },
    {
      index: 6,
      name: 'Presidential Inauguration Invite',
      description: 'Front row. Photo opportunity. The photo is now in the lobby.',
    },
    {
      index: 7,
      name: 'Regulatory Capture Premium',
      description: 'The bureau now writes the industry regulations. The industry was consulted.',
    },
  ],

  political_dynasty: [
    {
      index: 0,
      name: 'Provincial Media Ownership',
      description: 'Two radio stations. One "community" newspaper. Editorial independence: respected, technically.',
    },
    {
      index: 1,
      name: 'Family Foundation (Tax-Exempt)',
      description: 'Charitable. All donations are tax-deductible. Some donations come from government funds.',
    },
    {
      index: 2,
      name: 'Barangay Captain Network',
      description: '85% of barangay captains owe the family something. The other 15% owe more.',
    },
    {
      index: 3,
      name: 'Utility Franchise Control',
      description: 'Water district. Power cooperative. Bus terminal. The trifecta of provincial grip.',
    },
    {
      index: 4,
      name: 'Election Machine Deployment',
      description: 'Watchers at every precinct. Some watchers count. Some watchers discourage counting.',
    },
    {
      index: 5,
      name: 'Namesake Public Infrastructure',
      description: '[Family Name] Boulevard. [Family Name] Medical Center. [Family Name] Elementary School.',
    },
    {
      index: 6,
      name: 'Bloc Vote Arrangement',
      description: 'Delivered reliably. The arrangement is verbal. The delivery is not.',
    },
    {
      index: 7,
      name: 'Party Switching Premium',
      description: 'They were in the administration party. Now they are also in the administration party.',
    },
  ],

  hired_goons: [
    {
      index: 0,
      name: 'License to Carry (Bulk)',
      description: '82 LTOPF licenses processed simultaneously. The licensing officer was very efficient.',
    },
    {
      index: 1,
      name: 'Tinted Vehicle Allowance',
      description: 'All pickup trucks. All tinted. All with government plates from a cooperative.',
    },
    {
      index: 2,
      name: 'Daily Allowance Structure',
      description: '₱1,500 per day per "volunteer." Paid in cash. No payroll records.',
    },
    {
      index: 3,
      name: 'Radio Communication Network',
      description: 'Handheld radios. Encrypted. On a frequency not registered with the NTC.',
    },
    {
      index: 4,
      name: 'Legal Retainer (Proactive)',
      description: 'A law firm on permanent retainer. For "labor concerns." They have never handled labor law.',
    },
    {
      index: 5,
      name: 'Community Volunteer Recognition',
      description: 'Officially a people\'s organization. COA-exempt. DOJ-registered. DILG-ignored.',
    },
    {
      index: 6,
      name: 'Intelligence Sharing Protocol',
      description: 'They share information with local law enforcement. The sharing is one-directional.',
    },
    {
      index: 7,
      name: 'Immunity by Proximity',
      description: 'The officers present at the scene have been "reassigned" ahead of the investigation.',
    },
  ],

  artista_senator: [
    {
      index: 0,
      name: 'Endorsement Deal (Government Edition)',
      description: 'Product: public service. Tagline: "Para sa Bayan." The product is also their product line.',
    },
    {
      index: 1,
      name: 'Privilege Speech Writers',
      description: 'Professional speechwriters. The senator reads the speech for the first time at the podium.',
    },
    {
      index: 2,
      name: 'Afternoon Talk Show Slot',
      description: 'Still booked. Senate schedule permitting. Senate schedule is very permitting.',
    },
    {
      index: 3,
      name: 'Fan Club Political Organization',
      description: 'Fan clubs registered as political organizations. Volunteers: enthusiastic. Compensated: indirectly.',
    },
    {
      index: 4,
      name: 'Legislative Staff (Ghostwriters)',
      description: 'Bills filed: 47. Bills written by the senator personally: 0. Bills passed: 1 (renaming a plaza).',
    },
    {
      index: 5,
      name: 'Media Coverage Guarantee',
      description: 'Anything they say is news. Anything they wear is news. The Senate is a content machine.',
    },
    {
      index: 6,
      name: 'Reelection Name Recall',
      description: 'The name is already in 12 million homes. This is not a campaign. It is infrastructure.',
    },
    {
      index: 7,
      name: 'Legacy Bill (Named After Them)',
      description: 'The [Senator Name] Act. Cosigned by everyone who wants something from them.',
    },
  ],

  private_army: [
    {
      index: 0,
      name: 'Armory Licensing (Alternative Sources)',
      description: 'Some licensed. Some not yet licensed. The process is ongoing.',
    },
    {
      index: 1,
      name: 'Agricultural Cover Operations',
      description: 'The farm employs 200 security aides. The farm is 3 hectares. The math is fine.',
    },
    {
      index: 2,
      name: 'Local Government Coordination',
      description: 'Coordination: they know where the army is. The army knows where they live.',
    },
    {
      index: 3,
      name: 'Witness Management Program',
      description: 'Witnesses are located. Relocated. Or otherwise unavailable for further testimony.',
    },
    {
      index: 4,
      name: 'Case Archival Rate',
      description: 'The case count is high. The conviction rate is not. This is the system.',
    },
    {
      index: 5,
      name: 'Regional Intelligence Integration',
      description: 'They know things before the intelligence community does. This is noted and ignored.',
    },
    {
      index: 6,
      name: 'Elected Office as Umbrella',
      description: 'When you hold office, you hold immunity. The army is a campaign promise kept.',
    },
    {
      index: 7,
      name: 'Perpetual Operational Status',
      description: 'They are always there. Election season, peace negotiations, visiting dignitaries. Always.',
    },
  ],

  family_province: [
    {
      index: 0,
      name: 'Electoral Map Ownership',
      description: 'Every barangay captain: accountable. Every precinct: mapped. Every result: known three days early.',
    },
    {
      index: 1,
      name: 'Franchise Consolidation',
      description: 'Fuel. Sand and gravel. Trucking. Copra trading. The family is the economy.',
    },
    {
      index: 2,
      name: 'Judicial Relationship Network',
      description: 'The regional trial court judge. The CA justice from this province. The connection is noted.',
    },
    {
      index: 3,
      name: 'Police Rotation Influence',
      description: 'Chiefs who cooperate: stay. Chiefs who don\'t: transferred to Eastern Samar.',
    },
    {
      index: 4,
      name: 'Inter-Provincial Alliance',
      description: 'The family three provinces over has an understanding with your family. A wedding helped.',
    },
    {
      index: 5,
      name: 'Media Blackout Capability',
      description: 'Local news: controlled. Regional broadsheet: majority-owned. National reach: managed.',
    },
    {
      index: 6,
      name: 'Disaster Fund Priority Access',
      description: 'NDRRMC funds released to province. Governor determines distribution. Governor is your brother.',
    },
    {
      index: 7,
      name: 'Perpetual Dynasty Mechanism',
      description: 'The barangay is named after the patriarch. The school after the matriarch. The port after the son.',
    },
  ],

  shadow_power: [
    {
      index: 0,
      name: 'Board Appointment Influence',
      description: "They didn't appoint the board. They told the person who appoints the board.",
    },
    {
      index: 1,
      name: 'Intelligence Fund Access',
      description: 'Confidential. No receipt. No audit. No question.',
    },
    {
      index: 2,
      name: 'Regulatory Exemption Arrangement',
      description: 'The regulations do not apply to them. This is not written anywhere. It is understood.',
    },
    {
      index: 3,
      name: 'Legal Case Dormancy',
      description: 'Three cases. Filed. Archived. The case numbers are very hard to look up.',
    },
    {
      index: 4,
      name: 'Administration Transition Protocol',
      description: 'Every new administration inherits the arrangement. It is never discussed in the transition briefing.',
    },
    {
      index: 5,
      name: 'Media Narrative Management',
      description: 'The story that appears is not the story that happened. This gap is managed.',
    },
    {
      index: 6,
      name: 'Offshore Holdings Structuring',
      description: 'Layered. Jurisdictioned. Invisible to the BIR. Very visible to the recipients.',
    },
    {
      index: 7,
      name: 'Perpetual Political Insurance',
      description: 'Whatever happens, they remain. Administrations change. The arrangement does not.',
    },
  ],

  trillionaire_family: [
    {
      index: 0,
      name: 'Vertical Integration Pass',
      description: 'They own the input, the process, the output, and the regulator. The market is them.',
    },
    {
      index: 1,
      name: 'Infrastructure Concession Portfolio',
      description: 'Toll roads. Ports. Airports. Water systems. The public pays. The family collects.',
    },
    {
      index: 2,
      name: 'Media Consolidation',
      description: 'Three networks. Two newspapers. One narrative.',
    },
    {
      index: 3,
      name: 'Bank Ownership Advantage',
      description: 'They own the bank. The bank lends to their companies. At favorable rates.',
    },
    {
      index: 4,
      name: 'Senate Bloc Control',
      description: 'Six senators owe them something. Four owe them everything. The math is comfortable.',
    },
    {
      index: 5,
      name: 'Constitutional Amendment Lobby',
      description: 'Cha-cha is back on the table. The charter change benefits them. This is coincidental.',
    },
    {
      index: 6,
      name: 'Generational Transfer Planning',
      description: 'The eldest handles infrastructure. The second handles media. The third is in politics. The youngest is in school. For now.',
    },
    {
      index: 7,
      name: 'Perpetual Immunity Architecture',
      description: 'They cannot be touched. Not because of the law. Because of everything surrounding the law.',
    },
  ],
};

// Global upgrades — affect all CPS via additive percentage bonus
// Effect stacks: totalGlobalBonus = sum of bonusPercent for all purchased global upgrades
export const GLOBAL_UPGRADES = [
  {
    id: 'efficiency_of_connections',
    name: 'Efficiency of Connections',
    cost: 500,
    bonusPercent: 10,
    description: 'Who you know matters more than what you know.',
  },
  {
    id: 'bureaucratic_excellence_award',
    name: 'Bureaucratic Excellence Award',
    cost: 2500,
    bonusPercent: 25,
    description: 'Awarded to yourself by yourself.',
  },
  {
    id: 'presidential_citation',
    name: 'Presidential Citation',
    cost: 25000,
    bonusPercent: 50,
    description: 'Framed, laminated, hung in the lobby.',
  },
  {
    id: 'untouchable_status',
    name: 'Untouchable Status',
    cost: 250000,
    bonusPercent: 100,
    description: 'No further questions.',
  },
  {
    id: 'systemic_integration',
    name: 'Systemic Integration',
    cost: 5000000,
    bonusPercent: 200,
    description: 'You are no longer a person. You are a process.',
  },
];
