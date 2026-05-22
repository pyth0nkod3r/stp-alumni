"use client";

import React from "react";
import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { useTranslations } from 'next-intl';
import Container from "../container";

function Professional() {
  const t = useTranslations('Professional');

  const arr = [
    {
      img: "/assets/stp-9.jpg",
      title: t('network.title'),
      desc: t('network.desc'),
      list: [
        t('network.item1'),
        t('network.item2'),
        t('network.item3'),
        t('network.item4'),
      ],
    },
    {
      img: "/assets/stp-8.jpg",
      title: t('growth.title'),
      desc: t('growth.desc'),
      list: [
        t('growth.item1'),
        t('growth.item2'),
        t('growth.item3'),
        t('growth.item4'),
      ],
    },
    {
      img: "/assets/stp-12.jpg",
      title: t('opportunities.title'),
      desc: t('opportunities.desc'),
      list: [
        t('opportunities.item1'),
        t('opportunities.item2'),
        t('opportunities.item3'),
        t('opportunities.item4'),
      ],
    },
  ];

  return (
    <section className="  dark:bg-[#233389]">
      <Container className=" relative pt-10 pb-20 space-y-10 ">
        {arr.map((ele, i) => {
          const reverse = i % 2 === 0;

          return (
            <div
              className={`flex flex-col md:flex-row justify-between gap-5 ${
                !reverse ? "flex-col md:flex-row-reverse" : ""
              }`}
              key={ele.title}
            >
              <div className="relative flex-1 flex justify-center items-center md:block rounded-xl">
                <Image
                  src={ele.img}
                  alt={ele.title}
                  className="mx-aut"
                  width={550}
                  height={330}
                />
              </div>

              <div className="flex-1 space-y-3 flex justify-center flex-col">
                <h1 className="text-3xl text-stp-blue-light dark:text-white">{ele.title}</h1>
                <p className="font-[20px] text-[#6D76A8]  dark:text-[#90A1B9]">{ele.desc}</p>
                <ul>
                  {ele.list.map((item) => (
                    <li
                      className="flex items-start gap-2 my-1 font-[18px] text-[#959CC3]  dark:text-[#CAD5E2]"
                      key={item}
                    >
                      <CircleCheck className="mt-1 h-4 w-4 text-orange-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </Container>
   </section>
  );
}

export default Professional;