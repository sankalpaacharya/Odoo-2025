"use client";

import { Button } from "@/components/ui/button";
import { Plus, X, Edit2 } from "lucide-react";
import { EditableSection } from "@/components/editable-section";
import { EditableTextarea } from "@/components/editable-textarea";
import type { ProfileData, Skill, Certification } from "@/types/profile";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ResumeTab({ profile }: { profile: ProfileData }) {
  const updateProfile = useUpdateProfile();
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);
  const [skillForm, setSkillForm] = useState<Skill>({ name: "", level: "" });
  const [certForm, setCertForm] = useState<Certification>({ name: "", issuer: "", date: "" });
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);

  const handleFieldSave = async (field: string, value: string) => {
    await updateProfile.mutateAsync({ [field]: value });
  };

  const handleAddSkill = async () => {
    if (!skillForm.name.trim()) {
      toast.error("Skill name is required");
      return;
    }

    const currentSkills = profile.skills || [];
    let updatedSkills: Skill[];

    if (editingSkillIndex !== null) {
      updatedSkills = currentSkills.map((skill, idx) => (idx === editingSkillIndex ? { ...skillForm, id: skill.id } : skill));
    } else {
      updatedSkills = [...currentSkills, { ...skillForm, id: Date.now().toString() }];
    }

    try {
      await updateProfile.mutateAsync({ skills: updatedSkills });
      toast.success(editingSkillIndex !== null ? "Skill updated" : "Skill added");
      setSkillForm({ name: "", level: "" });
      setIsSkillDialogOpen(false);
      setEditingSkillIndex(null);
    } catch (error) {
      toast.error("Failed to save skill");
    }
  };

  const handleDeleteSkill = async (index: number) => {
    const currentSkills = profile.skills || [];
    const updatedSkills = currentSkills.filter((_, idx) => idx !== index);

    try {
      await updateProfile.mutateAsync({ skills: updatedSkills });
      toast.success("Skill removed");
    } catch (error) {
      toast.error("Failed to remove skill");
    }
  };

  const handleEditSkill = (index: number) => {
    const skill = (profile.skills || [])[index];
    if (skill) {
      setSkillForm({ name: skill.name, level: skill.level || "" });
      setEditingSkillIndex(index);
      setIsSkillDialogOpen(true);
    }
  };

  const handleAddCertification = async () => {
    if (!certForm.name.trim()) {
      toast.error("Certification name is required");
      return;
    }

    const currentCerts = profile.certifications || [];
    let updatedCerts: Certification[];

    if (editingCertIndex !== null) {
      updatedCerts = currentCerts.map((cert, idx) => (idx === editingCertIndex ? { ...certForm, id: cert.id } : cert));
    } else {
      updatedCerts = [...currentCerts, { ...certForm, id: Date.now().toString() }];
    }

    try {
      await updateProfile.mutateAsync({ certifications: updatedCerts });
      toast.success(editingCertIndex !== null ? "Certification updated" : "Certification added");
      setCertForm({ name: "", issuer: "", date: "" });
      setIsCertDialogOpen(false);
      setEditingCertIndex(null);
    } catch (error) {
      toast.error("Failed to save certification");
    }
  };

  const handleDeleteCertification = async (index: number) => {
    const currentCerts = profile.certifications || [];
    const updatedCerts = currentCerts.filter((_, idx) => idx !== index);

    try {
      await updateProfile.mutateAsync({ certifications: updatedCerts });
      toast.success("Certification removed");
    } catch (error) {
      toast.error("Failed to remove certification");
    }
  };

  const handleEditCertification = (index: number) => {
    const cert = (profile.certifications || [])[index];
    if (cert) {
      setCertForm({ name: cert.name, issuer: cert.issuer || "", date: cert.date || "" });
      setEditingCertIndex(index);
      setIsCertDialogOpen(true);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <EditableTextarea
          label="About"
          value={profile.about || ""}
          onSave={(value) => handleFieldSave("about", value)}
          placeholder="Tell us about yourself..."
          rows={5}
        />

        <EditableTextarea
          label="What I love about my job"
          value={profile.jobLove || ""}
          onSave={(value) => handleFieldSave("jobLove", value)}
          placeholder="Share what you love about your work..."
          rows={5}
        />

        <EditableTextarea
          label="My interests and hobbies"
          value={profile.interests || ""}
          onSave={(value) => handleFieldSave("interests", value)}
          placeholder="Tell us about your interests and hobbies..."
          rows={5}
        />
      </div>

      {/* Column 2 - Skills and Certifications (2 rows) */}
      <div className="space-y-6">
        <EditableSection
          title="Skills"
          actionButton={
            <Dialog
              open={isSkillDialogOpen}
              onOpenChange={(open) => {
                setIsSkillDialogOpen(open);
                if (!open) {
                  setSkillForm({ name: "", level: "" });
                  setEditingSkillIndex(null);
                }
              }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSkillIndex !== null ? "Edit Skill" : "Add Skill"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="skill-name">Skill Name *</Label>
                    <Input
                      id="skill-name"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="e.g., React, Python, Project Management"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill-level">Level (Optional)</Label>
                    <Input
                      id="skill-level"
                      value={skillForm.level}
                      onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })}
                      placeholder="e.g., Expert, Intermediate, Beginner"
                    />
                  </div>
                  <Button onClick={handleAddSkill} className="w-full">
                    {editingSkillIndex !== null ? "Update Skill" : "Add Skill"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={skill.id || index} variant="secondary" className="text-sm py-1.5 px-3 gap-2">
                  <span>
                    {skill.name}
                    {skill.level && <span className="text-muted-foreground ml-1">• {skill.level}</span>}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditSkill(index)} className="hover:text-primary transition-colors" title="Edit skill">
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleDeleteSkill(index)} className="hover:text-destructive transition-colors" title="Delete skill">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">No skills added yet</div>
          )}
        </EditableSection>

        <EditableSection
          title="Certifications"
          actionButton={
            <Dialog
              open={isCertDialogOpen}
              onOpenChange={(open) => {
                setIsCertDialogOpen(open);
                if (!open) {
                  setCertForm({ name: "", issuer: "", date: "" });
                  setEditingCertIndex(null);
                }
              }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Certification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCertIndex !== null ? "Edit Certification" : "Add Certification"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="cert-name">Certification Name *</Label>
                    <Input
                      id="cert-name"
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-issuer">Issuing Organization (Optional)</Label>
                    <Input
                      id="cert-issuer"
                      value={certForm.issuer}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cert-date">Date Obtained (Optional)</Label>
                    <Input id="cert-date" type="date" value={certForm.date} onChange={(e) => setCertForm({ ...certForm, date: e.target.value })} />
                  </div>
                  <Button onClick={handleAddCertification} className="w-full">
                    {editingCertIndex !== null ? "Update Certification" : "Add Certification"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }>
          {profile.certifications && profile.certifications.length > 0 ? (
            <div className="space-y-3">
              {profile.certifications.map((cert, index) => (
                <div key={cert.id || index} className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium">{cert.name}</h4>
                    {cert.issuer && <p className="text-sm text-muted-foreground">{cert.issuer}</p>}
                    {cert.date && <p className="text-xs text-muted-foreground mt-1">{new Date(cert.date).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCertification(index)} className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCertification(index)} className="h-8 w-8 hover:text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">No certifications added yet</div>
          )}
        </EditableSection>
      </div>
    </div>
  );
}
