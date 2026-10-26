"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { CardDecorator } from "@/components/ui/card-decorator"
import { Globe } from "lucide-react"
import { Github, Linkedin } from "@/components/icons/brand-icons"

const team = [
  {
    id: 1,
    name: "Alexandra Chen",
    role: "Nhà sáng lập và giám đốc điều hành",
    description:
      "Từng đồng sáng lập TechFlow và làm việc tại Microsoft, Google.",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=60&w=150&auto=format&fit=crop",
    fallback: "AC",
    social: {
      linkedin: "#",
      github: "#",
      website: "#",
    },
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Quản lý kỹ thuật",
    description: "Từng dẫn dắt đội ngũ kỹ thuật tại Stripe, Discord và Meta Labs.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=60&w=150&auto=format&fit=crop",
    fallback: "MR",
    social: {
      linkedin: "#",
      github: "#",
      website: "#",
    },
  },
  {
    id: 3,
    name: "Sophie Laurent",
    role: "Quản lý sản phẩm",
    description: "Từng quản lý sản phẩm tại Linear, Lambda School và On Deck.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=60&w=150&auto=format&fit=crop",
    fallback: "SL",
    social: {
      linkedin: "#",
      github: "#",
      website: "#",
    },
  },
  {
    id: 4,
    name: "David Kim",
    role: "Lập trình viên giao diện",
    description: "Từng phát triển giao diện tại Linear, Coinbase và PostScript.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=60&w=150&auto=format&fit=crop",
    fallback: "DK",
    social: {
      linkedin: "#",
      github: "#",
      website: "#",
    },
  },
  {
    id: 5,
    name: "Emma Thompson",
    role: "Lập trình viên máy chủ",
    description: "Phụ trách phát triển hệ thống máy chủ tại Clearbit, từng làm việc tại Loom.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=60&w=150&auto=format&fit=crop",
    fallback: "ET",
    social: {
      linkedin: "#",
      github: "#",
      website: "#",
    },
  },
  {
    id: 6,
    name: "Ryan Mitchell",
    role: "Nhà thiết kế sản phẩm",
    description:
      "Thành viên đội thiết kế ban đầu của Figma, từng làm việc tại Pleo, Stripe và Tile.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=60&w=150&auto=format&fit=crop",
    fallback: "RM",
    social: {
      linkedin: "#",
      github: "#",
      website: "#",
    },
  },
  {
    id: 7,
    name: "James Anderson",
    role: "UX Researcher",
    description:
      "Phụ trách nghiên cứu người dùng cho Slack, cộng tác với Netflix và Udacity.",
    image:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?q=60&w=150&auto=format&fit=crop",
    fallback: "JA",
    social: {
      linkedin: "#",
      github: "#",
      website: "#",
    },
  },
  {
    id: 8,
    name: "Isabella Garcia",
    role: "Chuyên viên hỗ trợ khách hàng",
    description: "Phụ trách trải nghiệm khách hàng tại Wealthsimple, từng làm việc tại PagerDuty và Squreen.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=60&w=150&auto=format&fit=crop",
    fallback: "IG",
    social: {
      linkedin: "#",
      github: "#",
      website: "#",
    },
  },
]

export function TeamSection() {
  return (
    <section id="team" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Đội ngũ của chúng tôi
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Gặp gỡ đội ngũ
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Chúng tôi là đội ngũ yêu thích sáng tạo và giải quyết vấn đề, luôn hướng đến những trải nghiệm số hữu ích.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {team.map((member) => (
            <Card key={member.id} className="shadow-xs py-2">
              <CardContent className="p-4">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <CardDecorator>
                      <Avatar className="size-24 border shadow-lg">
                        <AvatarImage
                          src={member.image}
                          alt={member.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-lg font-semibold">
                          {member.fallback}
                        </AvatarFallback>
                      </Avatar>
                    </CardDecorator>
                  </div>

                  {/* Name and Role */}
                  <CardTitle className="mb-1 text-lg">{member.name}</CardTitle>
                  <CardDescription className="mb-3 font-medium text-primary">
                    {member.role}
                  </CardDescription>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {member.description}
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer hover:text-primary"
                      nativeButton={false}
                      render={
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} LinkedIn`}
                        />
                      }
                    >
                      <Linkedin />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer hover:text-primary"
                      nativeButton={false}
                      render={
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} GitHub`}
                        />
                      }
                    >
                      <Github />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer hover:text-primary"
                      nativeButton={false}
                      render={
                        <a
                          href={member.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} Website`}
                        />
                      }
                    >
                      <Globe />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
