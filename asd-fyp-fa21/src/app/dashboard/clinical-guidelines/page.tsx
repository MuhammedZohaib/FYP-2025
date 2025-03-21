import {
  FileText,
  Shield,
  Database,
  Brain,
  Users,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function ClinicalGuidelinesPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-rose-400 font-medium">
              Clinical Guidelines
            </h1>
            <span className="text-gray-400 flex items-center">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-xs mr-1">
                <FileText className="w-3 h-3" />
              </span>
              v2.1
            </span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded border border-gray-700 text-sm hover:bg-gray-800 transition-colors flex items-center gap-1"
          >
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h2 className="text-lg font-medium mb-3 text-blue-400">
              Introduction
            </h2>
            <p className="text-gray-300 mb-3">
              These clinical guidelines outline the protocols for using the ASD
              Diagnosis Platform, which leverages EEG data, multimedia analysis,
              and machine learning models to assist in the diagnosis of Autism
              Spectrum Disorder (ASD).
            </p>
            <p className="text-gray-300">
              The platform is designed as a clinical decision support tool and
              should be used by qualified healthcare professionals in
              conjunction with established diagnostic criteria and clinical
              judgment.
            </p>
          </div>
        </div>

        {/* Guidelines with timeline */}
        <div className="relative">
          {/* Vertical timeline */}
          <div className="absolute left-[22px] top-0 bottom-0 w-0 border-l border-gray-700 h-full"></div>

          {/* Data Privacy & Security */}
          <GuidelineSection
            time="01"
            title="Data Privacy & Security"
            icon={<Shield className="w-5 h-5 text-rose-400" />}
          >
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>
                All patient data must be encrypted both in transit and at rest
                using AES-256 encryption.
              </li>
              <li>
                Access to patient data is restricted to authorized healthcare
                professionals with valid credentials.
              </li>
              <li>
                Patient consent must be obtained before collecting any data,
                including EEG recordings, images, audio, or video.
              </li>
              <li>
                Data retention policies must comply with HIPAA regulations and
                local healthcare data protection laws.
              </li>
              <li>
                All data access is logged and auditable for compliance and
                security purposes.
              </li>
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-400 text-sm">HIPAA Compliant</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-3"></span>
              <span className="text-emerald-400 text-sm">GDPR Compliant</span>
            </div>
          </GuidelineSection>

          {/* EEG Acquisition */}
          <GuidelineSection
            time="02"
            title="EEG Data Acquisition"
            icon={<Brain className="w-5 h-5 text-blue-400" />}
          >
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li>
                Use only approved EEG devices that meet medical-grade standards
                for signal quality.
              </li>
              <li>
                EEG recordings should be conducted in a quiet environment with
                minimal electrical interference.
              </li>
              <li>
                Standard 10-20 electrode placement system must be used for
                consistency.
              </li>
              <li>
                Minimum recording duration should be 20 minutes, including both
                resting state and task-based activities.
              </li>
              <li>
                Artifact rejection and filtering should be applied according to
                the platform's technical specifications.
              </li>
            </ul>
            <div className="mt-4 bg-gray-800 p-3 rounded-md border border-gray-700">
              <h4 className="text-sm font-medium text-white mb-2">
                Recommended EEG Parameters:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sampling Rate:</span>
                  <span className="text-white">≥ 250 Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bandwidth:</span>
                  <span className="text-white">0.1-100 Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Impedance:</span>
                  <span className="text-white\">5 kΩ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reference:</span>
                  <span className="text-white">Linked mastoids</span>
                </div>
              </div>
            </div>
          </GuidelineSection>

          {/* Multimedia Data Collection */}
          <GuidelineSection
            time="03"
            title="Multimedia Data Collection"
            icon={<Database className="w-5 h-5 text-purple-400" />}
          >
            <p className="text-gray-300 mb-3">
              The platform analyzes various multimedia inputs to supplement EEG
              data for a comprehensive assessment.
            </p>
            <div className="space-y-4">
              <div className="border-l-2 border-blue-500 pl-3">
                <h4 className="text-blue-400 font-medium mb-1">
                  Video Recording
                </h4>
                <p className="text-gray-300 text-sm">
                  Record in well-lit environment, minimum 720p resolution,
                  focusing on facial expressions and body movements during
                  structured activities.
                </p>
              </div>
              <div className="border-l-2 border-green-500 pl-3">
                <h4 className="text-green-400 font-medium mb-1">
                  Audio Recording
                </h4>
                <p className="text-gray-300 text-sm">
                  Use noise-cancelling microphones, record speech samples
                  including conversation, narrative tasks, and emotional
                  responses.
                </p>
              </div>
              <div className="border-l-2 border-yellow-500 pl-3">
                <h4 className="text-yellow-400 font-medium mb-1">
                  Image Capture
                </h4>
                <p className="text-gray-300 text-sm">
                  Standardized photographs of facial expressions in response to
                  various stimuli, following the platform's image capture
                  protocol.
                </p>
              </div>
            </div>
          </GuidelineSection>

          {/* Patient Eligibility */}
          <GuidelineSection
            time="04"
            title="Patient Eligibility & Preparation"
            icon={<Users className="w-5 h-5 text-amber-400" />}
          >
            <div className="space-y-3 text-gray-300">
              <p>
                The platform is designed for individuals aged 2-18 years with
                suspected ASD. Patients should meet the following criteria:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  No history of traumatic brain injury or neurological disorders
                  that may affect EEG readings
                </li>
                <li>
                  Not currently taking medications known to significantly alter
                  EEG patterns (if unavoidable, document in patient record)
                </li>
                <li>
                  Able to tolerate EEG electrode placement for the required
                  duration
                </li>
              </ul>
              <p className="font-medium text-white mt-3">
                Patient Preparation:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Patients should have clean, dry hair without styling products
                </li>
                <li>Schedule sessions during optimal alertness periods</li>
                <li>
                  Minimize caffeine and sugar intake for 4 hours prior to
                  assessment
                </li>
                <li>
                  Familiarize young patients with equipment using
                  age-appropriate explanations
                </li>
              </ul>
            </div>
          </GuidelineSection>

          {/* Interpretation of Results */}
          <GuidelineSection
            time="05"
            title="Interpretation of Results"
            icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          >
            <p className="text-gray-300 mb-3">
              The platform generates diagnostic insights based on integrated
              analysis of EEG patterns, behavioral markers, and multimedia data.
              Results should be interpreted as follows:
            </p>
            <div className="bg-gray-800 p-3 rounded-md border border-gray-700 mb-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 border-r border-gray-700">
                  <div className="text-rose-400 font-medium mb-1">
                    High Probability
                  </div>
                  <div className="text-white">≥ 85%</div>
                  <div className="text-gray-400 text-xs mt-1">
                    Warrants comprehensive clinical assessment
                  </div>
                </div>
                <div className="text-center p-2 border-r border-gray-700">
                  <div className="text-amber-400 font-medium mb-1">
                    Moderate Probability
                  </div>
                  <div className="text-white">60-84%</div>
                  <div className="text-gray-400 text-xs mt-1">
                    Consider additional testing
                  </div>
                </div>
                <div className="text-center p-2">
                  <div className="text-blue-400 font-medium mb-1">
                    Low Probability
                  </div>
                  <div className="text-white">60%</div>
                  <div className="text-gray-400 text-xs mt-1">
                    Monitor and reassess as needed
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-md border border-amber-900/50">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-amber-200 text-sm">
                The platform's results are intended to support clinical
                decision-making and should not replace comprehensive diagnostic
                evaluation by qualified healthcare professionals.
              </p>
            </div>
          </GuidelineSection>

          {/* Regulatory Compliance */}
          <GuidelineSection
            time="06"
            title="Regulatory Compliance"
            icon={<FileText className="w-5 h-5 text-gray-400" />}
            isLast={true}
          >
            <div className="space-y-3 text-gray-300">
              <p>
                This platform adheres to the following regulatory standards and
                guidelines:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>FDA guidelines for Clinical Decision Support Software</li>
                <li>HIPAA Privacy and Security Rules</li>
                <li>
                  General Data Protection Regulation (GDPR) for EU patients
                </li>
                <li>
                  American Academy of Pediatrics guidelines for ASD screening
                </li>
                <li>
                  American Academy of Neurology practice parameters for EEG
                </li>
              </ul>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                  FDA Compliant
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                  HIPAA
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                  GDPR
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                  AAP Guidelines
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                  AAN Standards
                </span>
              </div>
            </div>
          </GuidelineSection>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-800 text-gray-400 text-sm">
          <p>Last updated: March 21, 2025 | Version 2.1</p>
          <p className="mt-2">
            For technical support or clinical questions, contact{" "}
            <a
              href="mailto:support@asddiagnosis.com"
              className="text-blue-400 hover:underline"
            >
              support@asddiagnosis.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

interface GuidelineSectionProps {
  time: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isLast?: boolean;
}

function GuidelineSection({
  time,
  title,
  icon,
  children,
  isLast = false,
}: GuidelineSectionProps) {
  return (
    <div className={`relative ${!isLast ? "mb-8" : ""}`}>
      {/* Time indicator with dot */}
      <div className="w-11 flex-shrink-0 pt-1 text-gray-500 text-sm relative">
        {time}
        <div className="absolute left-7 top-2 w-3 h-3 bg-gray-700 rounded-full transform -translate-x-1/2 z-20 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        </div>
      </div>

      {/* Content */}
      <div className="ml-10 bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
        <div className="ml-7">{children}</div>
      </div>
    </div>
  );
}
