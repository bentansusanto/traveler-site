"use client";

import Icon from "@/components/icon";
import { useFindAllBookersQuery } from "@/store/services/booker.service";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

interface Booker {
  id: string;
  name: string;
  email: string;
  phone_number: string;
}

interface BookerListModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (booker: { name: string; email: string; phone: string }) => void;
}

const useIsMobileOrTablet = () => {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean>(false);

  useEffect(() => {
    const check = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobileOrTablet;
};

export const BookerListModal = ({ open, onClose, onSelect }: BookerListModalProps) => {
  const t = useTranslations("OrderTour");
  const { data: bookersData, isLoading } = useFindAllBookersQuery();
  const [search, setSearch] = useState("");
  const isMobileOrTablet = useIsMobileOrTablet();

  const bookers: Booker[] = bookersData?.data || bookersData?.datas || [];

  const filtered = bookers.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.phone_number.includes(search)
  );

  const handleSelect = (b: Booker) => {
    onSelect({ name: b.name, email: b.email, phone: b.phone_number });
    onClose();
  };

  const modalBody = (
    <>
      {/* Search */}
      <div className="px-5 pt-3 pb-3">
        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={t("searchBookerPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus:border-emerald-300 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* List */}
      <div className="min-h-[180px] max-h-[60vh] overflow-y-auto px-5 pb-6 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Icon name="UserX" className="h-7 w-7 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {search ? t("notFound") : t("noBookerData")}
              </p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                {search
                  ? t("searchKeywordHint")
                  : t("emptyBookerHint")}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelect(b)}
              className="w-full flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition-all hover:border-emerald-200 hover:bg-emerald-50 active:scale-[0.99] group">
              {/* Avatar */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 group-hover:bg-emerald-200 transition-colors">
                {b.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{b.name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <Icon name="Mail" className="h-3 w-3 shrink-0" />
                    {b.email}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                    <Icon name="Phone" className="h-3 w-3" />
                    {b.phone_number}
                  </span>
                </div>
              </div>
              <Icon name="ChevronRight" className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>
          ))
        )}
      </div>
    </>
  );

  if (isMobileOrTablet) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent className="rounded-t-2xl max-h-[85vh]">
          <DrawerHeader className="border-b border-slate-100 px-5 py-3 text-left">
            <DrawerTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50">
                <Icon name="BookUser" className="h-4 w-4 text-emerald-600" />
              </div>
              {t("selectBookerModalTitle")}
            </DrawerTitle>
          </DrawerHeader>
          {modalBody}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b border-slate-100 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50">
              <Icon name="BookUser" className="h-4 w-4 text-emerald-600" />
            </div>
            {t("selectBookerModalTitle")}
          </DialogTitle>
        </DialogHeader>
        {modalBody}
      </DialogContent>
    </Dialog>
  );
};
