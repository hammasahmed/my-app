import React from "react";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";

const testimonials = [
  {
    quote:
      "I was impressed by the food! And I could really tell that they use high-quality ingredients. The staff was friendly and attentive. I'll definitely be back for more!",
    name: "Tamar Mendelson",
    designation: "Restaurant Critic",
    src: "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?q=80&w=1368&auto=format&fit=crop",
  },
  {
    quote:
      "This place exceeded all expectations! The atmosphere is inviting, and the staff truly goes above and beyond. I'll keep returning for more exceptional dining experience.",
    name: "Joe Charlescraft",
    designation: "Frequent Visitor",
    src: "https://images.unsplash.com/photo-1628749528992-f5702133b686?q=80&w=1368&auto=format&fit=crop",
  },
  {
    quote:
      "A hidden gem! The impeccable service and overall attention to detail created a memorable experience. I highly recommend it!",
    name: "Martina Edelweist",
    designation: "Satisfied Customer",
    src: "https://images.unsplash.com/photo-1524267213992-b76e8577d046?q=80&w=1368&auto=format&fit=crop",
  },
];

export const CircularTestimonialsDemo = () => (
  <section>
    <div className="bg-[#f7f7fa] p-20 rounded-lg min-h-[300px] flex flex-wrap gap-6 items-center justify-center relative">
      <div className="items-center justify-center relative flex" style={{ maxWidth: "1456px" }}>
        <CircularTestimonials
          testimonials={testimonials}
          autoplay={true}
          colors={{
            name: "#0a0a0a",
            designation: "#454545",
            testimony: "#171717",
            arrowBackground: "#141414",
            arrowForeground: "#f1f1f7",
            arrowHoverBackground: "#00A6FB",
          }}
          fontSizes={{ name: "28px", designation: "20px", quote: "20px" }}
        />
      </div>
    </div>

    <div className="bg-[#060507] p-16 rounded-lg min-h-[300px] flex flex-wrap gap-6 items-center justify-center relative">
      <div className="items-center justify-center relative flex" style={{ maxWidth: "1024px" }}>
        <CircularTestimonials
          testimonials={testimonials}
          autoplay={true}
          colors={{
            name: "#f7f7ff",
            designation: "#e1e1e1",
            testimony: "#f1f1f7",
            arrowBackground: "#0582CA",
            arrowForeground: "#141414",
            arrowHoverBackground: "#f7f7ff",
          }}
          fontSizes={{ name: "28px", designation: "20px", quote: "20px" }}
        />
      </div>
    </div>
  </section>
);

export default CircularTestimonialsDemo;
