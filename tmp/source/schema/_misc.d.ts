import type { EntityRecordBase, EntityRecordXtensions } from "./base";
export type TestimonialXtended = Testimonial & EntityRecordXtensions;
export type Testimonial = {
    content: string;
    imgUrl?: string;
} & EntityRecordBase;
export type FAQXtended = FAQ & EntityRecordXtensions;
export type FAQ = {
    question: string;
    answer: string;
} & EntityRecordBase;
export type CompanyXtended = Company & EntityRecordXtensions;
export type Company = {
    name: string;
    code: string;
    emailAddress: string;
    phoneNumber: string;
} & EntityRecordBase;
