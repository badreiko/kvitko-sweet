import { FC, useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Save, Globe, CreditCard, Bell, RefreshCw, Clock, Map, Image, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadHint } from "@/components/admin/ImageUploadHint";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebase/config";
import { compressImage, formatFileSize } from "@/utils/imageCompression";
import { HeroSettingsEditor } from "@/components/admin/HeroSettingsEditor";
import { useSiteTheme } from "@/context/SiteThemeContext";
import { HERO_THEME_LABELS, normalizeHeroSettings, resolveHeroTheme } from "@/lib/heroTheme";
import {
  getSiteSettings,
  updateSiteSettings,
  updateHeroThemeImage,
  SiteSettings,
  defaultSettings,
  SectionImages,
  HeroThemeId,
  HeroSettings
} from "@/firebase/services/settingsService";

const Settings: FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { refresh: refreshSiteTheme } = useSiteTheme();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  // Состояние, совпадающее с базой: по разнице с ним видно несохранённые правки.
  const [savedSettings, setSavedSettings] = useState<SiteSettings>(defaultSettings);
  /** Изменение, которое уже записано в базу (загрузка/удаление картинки). */
  const applyPersisted = (update: (prev: SiteSettings) => SiteSettings) => {
    setSettings(update);
    setSavedSettings(update);
  };
  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState<string | null>(null);
  const fileInputRefs = {
    deliverySection: useRef<HTMLInputElement>(null),
    customBouquet: useRef<HTMLInputElement>(null)
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
        setSavedSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Ошибка при загрузке настроек");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleOpeningHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [name]: value
      }
    }));
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const snapshot = settings;
      await updateSiteSettings(snapshot);
      setSavedSettings(snapshot);
      void refreshSiteTheme();
      const live = resolveHeroTheme(snapshot.heroSettings, snapshot.sectionImages);
      toast.success(`Сохранено. На главной сейчас тема «${HERO_THEME_LABELS[live.themeId]}»`);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Ошибка при сохранении настроек");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (sectionKey: keyof SectionImages, file: File) => {
    setUploadingSection(sectionKey);
    try {
      // Сжимаем изображение
      toast.info("Сжатие изображения...");
      const result = await compressImage(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        quality: 0.85,
        fileType: 'image/webp'
      });
      console.log(`Сжато: ${formatFileSize(result.originalSize)} -> ${formatFileSize(result.compressedSize)}`);

      // Загружаем в Firebase Storage
      const fileName = `${sectionKey}_${Date.now()}.webp`;
      const storageRef = ref(storage, `settings/section-images/${fileName}`);
      await uploadBytes(storageRef, result.file);
      const url = await getDownloadURL(storageRef);

      // Добавляем к массиву изображений
      const currentImages = settings.sectionImages?.[sectionKey] || [];
      const newImages = [...currentImages, url];
      const newSectionImages = { ...settings.sectionImages, [sectionKey]: newImages };
      applyPersisted(prev => ({ ...prev, sectionImages: newSectionImages }));
      await updateSiteSettings({ sectionImages: newSectionImages });

      toast.success("Изображение добавлено!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Ошибка при загрузке изображения");
    } finally {
      setUploadingSection(null);
    }
  };

  const handleImageDelete = async (sectionKey: keyof SectionImages, imageUrl: string) => {
    try {
      // Удаляем из Storage
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef).catch(() => { });

      // Удаляем из массива
      const currentImages = settings.sectionImages?.[sectionKey] || [];
      const newImages = currentImages.filter(img => img !== imageUrl);
      const newSectionImages = {
        ...settings.sectionImages,
        [sectionKey]: newImages.length > 0 ? newImages : undefined
      };

      // Убираем undefined значения
      if (!newSectionImages[sectionKey]) {
        delete newSectionImages[sectionKey];
      }

      applyPersisted(prev => ({ ...prev, sectionImages: newSectionImages }));
      await updateSiteSettings({ sectionImages: newSectionImages });

      toast.success("Изображение удалено");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Ошибка при удалении");
    }
  };

  const updateHeroDraft = (next: HeroSettings) => {
    setSettings(prev => ({ ...prev, heroSettings: next }));
  };

  const handleHeroUpload = async (
    theme: HeroThemeId,
    field: 'desktopImage' | 'mobileImage',
    file: File,
  ) => {
    setUploadingHero(`${theme}-${field}`);
    let uploadedRef: ReturnType<typeof ref> | null = null;
    try {
      const result = await compressImage(file, {
        maxSizeMB: 1.2,
        maxWidthOrHeight: 2400,
        quality: 0.88,
        fileType: 'image/webp',
      });
      uploadedRef = ref(storage, `settings/hero/${theme}/${field}-${crypto.randomUUID()}.webp`);
      await uploadBytes(uploadedRef, result.file, { contentType: 'image/webp' });
      const url = await getDownloadURL(uploadedRef);
      await updateHeroThemeImage(theme, field, url);
      // Функциональное обновление: черновик текста, набранный во время загрузки, не теряется.
      applyPersisted(prev => {
        const current = normalizeHeroSettings(prev.heroSettings);
        return {
          ...prev,
          heroSettings: { ...current, themes: { ...current.themes, [theme]: { ...current.themes[theme], [field]: url } } },
        };
      });
      void refreshSiteTheme();
      toast.success('Изображение сохранено и уже используется темой');
    } catch (error) {
      if (uploadedRef) await deleteObject(uploadedRef).catch(() => {});
      console.error('Error uploading hero image:', error);
      toast.error('Не удалось сохранить изображение Hero');
    } finally {
      setUploadingHero(null);
    }
  };

  const handleHeroRemove = async (theme: HeroThemeId, field: 'desktopImage' | 'mobileImage') => {
    const current = normalizeHeroSettings(settings.heroSettings);
    const oldUrl = current.themes[theme]?.[field];
    if (!oldUrl) return;
    setUploadingHero(`${theme}-${field}`);
    try {
      const themeContent = { ...current.themes[theme] };
      delete themeContent[field];
      const next: HeroSettings = {
        ...current,
        themes: { ...current.themes, [theme]: themeContent },
      };
      await updateHeroThemeImage(theme, field, null);
      applyPersisted(prev => {
        const latest = normalizeHeroSettings(prev.heroSettings);
        const latestTheme = { ...latest.themes[theme] };
        delete latestTheme[field];
        return { ...prev, heroSettings: { ...latest, themes: { ...latest.themes, [theme]: latestTheme } } };
      });
      const stillUsed = Object.values(next.themes).some(profile =>
        profile?.desktopImage === oldUrl || profile?.mobileImage === oldUrl,
      ) || settings.sectionImages?.heroSection?.includes(oldUrl);
      if (!stillUsed) {
        const imageRef = ref(storage, oldUrl);
        if (imageRef.fullPath.startsWith('settings/hero/')) {
          await deleteObject(imageRef).catch(error => console.error('Failed to remove old hero image:', error));
        }
      }
      toast.success('Изображение Hero удалено');
    } catch (error) {
      console.error('Error removing hero image:', error);
      toast.error('Не удалось удалить изображение Hero');
    } finally {
      setUploadingHero(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Единственная кнопка сохранения: прилипает к верху и подсвечивается,
            когда есть несохранённые изменения. */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 flex flex-wrap justify-between items-center gap-3 bg-background/95 backdrop-blur border-b">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Настройки</h2>
            <p className={isDirty ? "text-sm font-medium text-amber-700 dark:text-amber-400" : "text-sm text-muted-foreground"}>
              {isDirty ? "Есть несохранённые изменения — на сайте их пока нет" : "Все изменения сохранены"}
            </p>
          </div>
          <Button
            onClick={handleSaveSettings}
            variant={isDirty ? "default" : "outline"}
            disabled={!isDirty || isSaving || uploadingHero !== null || uploadingSection !== null}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Сохранение..." : "Сохранить все изменения"}
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-6 w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Основные</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Контакты</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Магазин</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Уведомления</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Интеграции</span>
            </TabsTrigger>
          </TabsList>

          {/* Основные настройки */}
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Основные настройки сайта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Название сайта</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Описание сайта</Label>
                    <Input
                      id="siteDescription"
                      name="siteDescription"
                      value={settings.siteDescription}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance">Режим обслуживания</Label>
                    <p className="text-sm text-muted-foreground">Включите, чтобы временно закрыть доступ к сайту</p>
                  </div>
                  <Switch
                    id="maintenance"
                    checked={settings.enableMaintenance}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'enableMaintenance')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Контакты, Время работы, Карта */}
          <TabsContent value="contacts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Контакты и Местоположение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email для связи</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Телефон для связи</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={settings.contactPhone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyIco">IČO</Label>
                  <Input
                    id="companyIco"
                    name="companyIco"
                    value={settings.companyIco || ""}
                    onChange={handleChange}
                    placeholder="např. 12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDic">DIČ (необязательно)</Label>
                  <Input
                    id="companyDic"
                    name="companyDic"
                    value={settings.companyDic || ""}
                    onChange={handleChange}
                    placeholder="např. CZ12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyRegistry">Данные о регистрации</Label>
                  <Textarea
                    id="companyRegistry"
                    name="companyRegistry"
                    value={settings.companyRegistry || ""}
                    onChange={handleChange}
                    placeholder="např. Zapsáno u Městského soudu v Praze, oddíl C, vložka 12345"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      name="facebookUrl"
                      placeholder="https://facebook.com/yourpage"
                      value={settings.facebookUrl || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input
                      id="instagramUrl"
                      name="instagramUrl"
                      placeholder="https://instagram.com/yourpage"
                      value={settings.instagramUrl || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Часы работы
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekdays">Понедельник - Пятница</Label>
                      <Input
                        id="weekdays"
                        name="weekdays"
                        value={settings.openingHours.weekdays}
                        onChange={handleOpeningHoursChange}
                        placeholder="9:00 - 19:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="saturday">Суббота</Label>
                      <Input
                        id="saturday"
                        name="saturday"
                        value={settings.openingHours.saturday}
                        onChange={handleOpeningHoursChange}
                        placeholder="9:00 - 17:00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sunday">Воскресенье</Label>
                      <Input
                        id="sunday"
                        name="sunday"
                        value={settings.openingHours.sunday}
                        onChange={handleOpeningHoursChange}
                        placeholder="10:00 - 15:00"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Карта (Embed)
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="mapEmbedUrl">Ссылка для встраивания (src из iframe Google Maps)</Label>
                    <Textarea
                      id="mapEmbedUrl"
                      name="mapEmbedUrl"
                      value={settings.mapEmbedUrl}
                      onChange={handleChange}
                      placeholder="https://www.google.com/maps/embed?..."
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Вставьте ссылку из тега src iframe, который можно получить на Google Maps (Поделиться - Встраивание карт)
                    </p>
                  </div>
                  {settings.mapEmbedUrl && (
                    <div className="mt-4 border rounded-md overflow-hidden aspect-video max-w-xl">
                      <iframe
                        src={settings.mapEmbedUrl}
                        title="Google Maps Location"
                        width="100%"
                        height="100%"
                        className="border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Настройки магазина */}
          <TabsContent value="shop" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки магазина</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Валюта</Label>
                    <Input
                      id="currency"
                      name="currency"
                      value={settings.currency}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Символ валюты</Label>
                    <Input
                      id="currencySymbol"
                      name="currencySymbol"
                      value={settings.currencySymbol}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Ставка налога (%)</Label>
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      value={settings.taxRate}
                      onChange={handleNumericChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Минимальная сумма заказа (Kč)</Label>
                    <Input
                      id="minOrderAmount"
                      name="minOrderAmount"
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={handleNumericChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="freeShippingThreshold">Бесплатная доставка от (Kč)</Label>
                    <Input
                      id="freeShippingThreshold"
                      name="freeShippingThreshold"
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={handleNumericChange}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="stockManagement">Управление складскими запасами</Label>
                    <p className="text-sm text-muted-foreground">Отслеживать количество товаров на складе</p>
                  </div>
                  <Switch
                    id="stockManagement"
                    checked={settings.enableStockManagement}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'enableStockManagement')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Заглушки для остальных вкладок */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Раздел в разработке.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Интеграции</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Раздел в разработке.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Изображения секций */}
          <TabsContent value="images" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Разделы главной страницы</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="hero">
                  <TabsList className="mb-6">
                    <TabsTrigger value="hero">Hero</TabsTrigger>
                    <TabsTrigger value="delivery">Доставка</TabsTrigger>
                    <TabsTrigger value="custom-bouquet">Свой букет</TabsTrigger>
                  </TabsList>

                <TabsContent value="hero" className="space-y-4">
                  <p className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    Картинки сохраняются сразу при загрузке. Всё остальное — кнопкой «Сохранить все изменения» вверху.
                  </p>
                  <HeroSettingsEditor
                    value={normalizeHeroSettings(settings.heroSettings)}
                    legacyImages={settings.sectionImages?.heroSection || []}
                    uploadingSlot={uploadingHero}
                    onChange={updateHeroDraft}
                    onUpload={handleHeroUpload}
                    onRemove={handleHeroRemove}
                  />
                </TabsContent>

                {/* Delivery Section Images */}
                <TabsContent value="delivery" className="space-y-3">
                  <ImageUploadHint target="delivery" />
                  <div className="flex justify-between items-center">
                    <Label>Секция доставки (Doručení květin)</Label>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        title="Изображение для секции доставки"
                        ref={fileInputRefs.deliverySection}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('deliverySection', file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.deliverySection.current?.click()}
                        disabled={uploadingSection === 'deliverySection'}
                      >
                        {uploadingSection === 'deliverySection' ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Загрузка...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />Добавить изображение</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(settings.sectionImages?.deliverySection || []).map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Delivery ${index + 1}`}
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageDelete('deliverySection', url)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!settings.sectionImages?.deliverySection || settings.sectionImages.deliverySection.length === 0) && (
                      <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Custom Bouquet Section Images */}
                <TabsContent value="custom-bouquet" className="space-y-3">
                  <ImageUploadHint target="customBouquet" />
                  <div className="flex justify-between items-center">
                    <Label>Секция "Создай свой букет" (Vytvořte si vlastní kytici)</Label>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        title="Изображение для кастомного букета"
                        ref={fileInputRefs.customBouquet}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('customBouquet', file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.customBouquet.current?.click()}
                        disabled={uploadingSection === 'customBouquet'}
                      >
                        {uploadingSection === 'customBouquet' ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Загрузка...</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />Добавить изображение</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(settings.sectionImages?.customBouquet || []).map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Custom Bouquet ${index + 1}`}
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageDelete('customBouquet', url)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!settings.sectionImages?.customBouquet || settings.sectionImages.customBouquet.length === 0) && (
                      <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
