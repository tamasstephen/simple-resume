import { ContactForm } from "./sections/ContactForm";
import { SummaryForm } from "./sections/SummaryForm";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { LinksSection } from "./sections/LinksSection";

/** The left-pane editor: all nine resume sections in order. */
export function Editor() {
  return (
    <>
      <ContactForm />
      <SummaryForm />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <ProjectsSection />
      <CertificationsSection />
      <LanguagesSection />
      <LinksSection />
    </>
  );
}
