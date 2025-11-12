import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Center,
  Stack
} from '@chakra-ui/react';
import { Play, Users, Trophy, Clock, Star, GamepadIcon, Zap, Sparkles, Gift, Rocket, Shield } from 'lucide-react';
import VideoBackground from '@/components/ui/VideoBackground';

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      const navOffset = 80;
      const y = featuresSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const gameFeatures = [
    {
      icon: GamepadIcon,
      title: "Console Gaming",
      description: "PS5, Xbox Series X, Nintendo Switch",
      color: "purple"
    },
    {
      icon: Trophy,
      title: "Tournois",
      description: "Compétitions hebdomadaires avec prix",
      color: "yellow"
    },
    {
      icon: Users,
      title: "Multijoueur",
      description: "Jouez avec vos amis en local",
      color: "pink"
    },
    {
      icon: Zap,
      title: "Système de points",
      description: "Gagnez des points et débloquez des récompenses",
      color: "cyan"
    }
  ];

  const tarifs = [
    { duree: "1 heure", prix: "100F", populaire: false, icon: Clock },
    { duree: "3 heures", prix: "250F", populaire: true, icon: Star },
    { duree: "Journée complète", prix: "500F", populaire: false, icon: Gift }
  ];

  const getColorScheme = (color) => {
    const schemes = {
      purple: { from: 'purple.500', to: 'pink.500', text: 'purple.300' },
      yellow: { from: 'yellow.400', to: 'orange.500', text: 'yellow.300' },
      pink: { from: 'pink.500', to: 'purple.600', text: 'pink.300' },
      cyan: { from: 'cyan.500', to: 'blue.600', text: 'cyan.300' }
    };
    return schemes[color] || schemes.purple;
  };

  return (
    <Box minH="100vh" bg="black" position="relative" overflow="hidden">
      {/* Navigation */}
      <Box
        as="nav"
        position="fixed"
        top={0}
        w="full"
        zIndex={50}
        bg="rgba(0, 0, 0, 0.8)"
        backdropFilter="blur(10px)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
      >
        <Container maxW="7xl" px={{ base: 6, md: 8 }}>
          <Flex justify="space-between" align="center" h={16}>
            <HStack spacing={2}>
              <Icon as={GamepadIcon} w={8} h={8} color="purple.400" />
              <Heading
                size="lg"
                bgGradient="linear(to-r, purple.400, pink.400)"
                bgClip="text"
                fontWeight="bold"
              >
                GameZone
              </Heading>
            </HStack>
            <Button
              onClick={() => setShowAuthModal(true)}
              bgGradient="linear(to-r, purple.600, blue.600)"
              color="white"
              px={6}
              rounded="full"
              fontWeight="semibold"
              _hover={{
                bgGradient: 'linear(to-r, purple.700, blue.700)',
                transform: 'scale(1.05)'
              }}
              transition="all 0.3s"
            >
              Se connecter
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section with Video Background */}
      <VideoBackground 
        videoSrc="/images/video/Cyber_Arcade_Neon_Ember.mp4"
        overlayOpacity={0.75}
        className="bg-black"
      >
        <Box
          position="relative"
          minH="100vh"
          bg="transparent"
          pt={24}
          pb={20}
          data-aos="fade-up"
        >
          <Container maxW="7xl" position="relative" zIndex={10}>
            {/* Hero Text */}
            <VStack spacing={8} textAlign="center" mb={12} data-aos="fade-down">
              <HStack spacing={2} mb={4}>
                <Icon as={Sparkles} w={6} h={6} color="yellow.400" className="animate-pulse" />
                <Text
                  color="purple.300"
                  fontWeight="semibold"
                  letterSpacing="widest"
                  textTransform="uppercase"
                  fontSize="sm"
                >
                  Bienvenue dans le futur du gaming
                </Text>
                <Icon as={Sparkles} w={6} h={6} color="yellow.400" className="animate-pulse" />
              </HStack>

              <Heading
                as="h1"
                size={{ base: "2xl", md: "3xl", lg: "4xl" }}
                bgGradient="linear(to-r, purple.400, pink.500)"
                bgClip="text"
                fontWeight="black"
                textShadow="0 0 30px rgba(147, 51, 234, 0.5)"
              >
                Votre Salle de Jeux
              </Heading>

              <Heading
                as="h2"
                size={{ base: "xl", md: "2xl", lg: "3xl" }}
                bgGradient="linear(to-r, pink.400, purple.600)"
                bgClip="text"
                fontWeight="black"
                textShadow="0 0 30px rgba(236, 72, 153, 0.5)"
              >
                Nouvelle Génération
              </Heading>

              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="gray.200"
                maxW="4xl"
                mx="auto"
                lineHeight="relaxed"
              >
                Rejoignez notre communauté grandissante et découvrez pourquoi nous sommes le gaming #1 de la région.
                Expérience gaming ultime avec consoles dernière génération et système de récompenses innovant!
              </Text>

              {/* CTA Buttons */}
              <HStack spacing={6} flexWrap="wrap" justify="center" data-aos="fade-up" data-aos-delay="400">
                <Button
                  onClick={() => setShowAuthModal(true)}
                  size="lg"
                  bgGradient="linear(to-r, purple.600, pink.600)"
                  color="white"
                  px={10}
                  py={6}
                  rounded="full"
                  fontWeight="bold"
                  fontSize="lg"
                  leftIcon={<Icon as={Rocket} className="animate-bounce" />}
                  _hover={{
                    bgGradient: 'linear(to-r, purple.700, pink.700)',
                    transform: 'scale(1.1)'
                  }}
                  transition="all 0.3s"
                  boxShadow="0 0 20px rgba(147, 51, 234, 0.5)"
                >
                  Commencer à jouer
                </Button>
                <Button
                  onClick={scrollToFeatures}
                  size="lg"
                  variant="outline"
                  borderColor="purple.400"
                  color="white"
                  px={10}
                  py={6}
                  rounded="full"
                  fontWeight="bold"
                  fontSize="lg"
                  leftIcon={<Icon as={Sparkles} />}
                  _hover={{
                    bg: 'purple.400',
                    bgOpacity: 0.2,
                    borderColor: 'pink.400'
                  }}
                  transition="all 0.3s"
                >
                  Découvrir
                </Button>
              </HStack>
            </VStack>

            {/* Feature Cards Grid */}
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, lg: 6 }} data-aos="zoom-in" data-aos-delay="600">
              {gameFeatures.map((feature, index) => (
                <Card
                  key={index}
                  bg="whiteAlpha.100"
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    transform: 'translateY(-5px)',
                    borderColor: getColorScheme(feature.color).text,
                    boxShadow: `0 10px 30px ${getColorScheme(feature.color).from}`
                  }}
                  transition="all 0.3s"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <CardBody>
                    <HStack spacing={3}>
                      <Icon as={feature.icon} w={8} h={8} color={getColorScheme(feature.color).text} />
                      <VStack align="start" spacing={0}>
                        <Text color="white" fontWeight="bold">{feature.title}</Text>
                        <Text color="gray.300" fontSize="sm">{feature.description}</Text>
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Container>
        </Box>
      </VideoBackground>

      {/* Features Section */}
      <Box id="features" py={20} bg="gray.900" data-aos="fade-up">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center" data-aos="zoom-in">
              <Heading
                size="2xl"
                bgGradient="linear(to-r, cyan.400, purple.500)"
                bgClip="text"
                fontWeight="black"
              >
                Pourquoi GameZone ?
              </Heading>
              <Text fontSize="xl" color="gray.400" maxW="2xl">
                La meilleure expérience de jeu avec des équipements de pointe
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              {[
                { icon: Shield, title: "Équipement Premium", desc: "Consoles et accessoires dernière génération" },
                { icon: Users, title: "Communauté Active", desc: "Rejoignez des milliers de joueurs passionnés" },
                { icon: Trophy, title: "Récompenses", desc: "Gagnez des points et échangez-les contre des prix" }
              ].map((item, index) => (
                <Card
                  key={index}
                  bg="gray.800"
                  border="1px solid"
                  borderColor="purple.500"
                  p={6}
                  textAlign="center"
                  _hover={{
                    transform: 'scale(1.05)',
                    borderColor: 'pink.500',
                    boxShadow: '0 10px 40px rgba(147, 51, 234, 0.4)'
                  }}
                  transition="all 0.3s"
                  data-aos="flip-up"
                  data-aos-delay={index * 150}
                >
                  <CardBody>
                    <VStack spacing={4}>
                      <Center
                        w={16}
                        h={16}
                        rounded="full"
                        bgGradient="linear(to-r, purple.500, pink.500)"
                      >
                        <Icon as={item.icon} w={8} h={8} color="white" />
                      </Center>
                      <Heading size="md" color="white">{item.title}</Heading>
                      <Text color="gray.400">{item.desc}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box py={20} bg="black" data-aos="fade-up">
        <Container maxW="7xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center" data-aos="zoom-in">
              <Heading
                size="2xl"
                bgGradient="linear(to-r, pink.400, purple.600)"
                bgClip="text"
                fontWeight="black"
              >
                Nos Tarifs
              </Heading>
              <Text fontSize="xl" color="gray.400">
                Des prix adaptés à tous les joueurs
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              {tarifs.map((tarif, index) => (
                <Card
                  key={index}
                  bg={tarif.populaire ? 'purple.900' : 'gray.900'}
                  border="2px solid"
                  borderColor={tarif.populaire ? 'purple.500' : 'gray.700'}
                  p={8}
                  position="relative"
                  _hover={{
                    transform: 'translateY(-10px)',
                    borderColor: tarif.populaire ? 'pink.500' : 'purple.500',
                    boxShadow: tarif.populaire 
                      ? '0 20px 60px rgba(147, 51, 234, 0.5)' 
                      : '0 10px 30px rgba(147, 51, 234, 0.3)'
                  }}
                  transition="all 0.3s"
                  data-aos="fade-up"
                  data-aos-delay={index * 150}
                >
                  {tarif.populaire && (
                    <Badge
                      position="absolute"
                      top={-3}
                      right={4}
                      colorScheme="purple"
                      fontSize="sm"
                      px={3}
                      py={1}
                      rounded="full"
                    >
                      ⭐ Populaire
                    </Badge>
                  )}
                  <CardBody>
                    <VStack spacing={6}>
                      <Icon as={tarif.icon} w={12} h={12} color="purple.400" />
                      <Heading size="md" color="white">{tarif.duree}</Heading>
                      <Heading size="3xl" color="purple.400">{tarif.prix}</Heading>
                      <Button
                        onClick={() => setShowAuthModal(true)}
                        w="full"
                        bgGradient={tarif.populaire 
                          ? "linear(to-r, purple.600, pink.600)" 
                          : "linear(to-r, gray.700, gray.800)"
                        }
                        color="white"
                        size="lg"
                        _hover={{
                          bgGradient: tarif.populaire 
                            ? 'linear(to-r, purple.700, pink.700)' 
                            : 'linear(to-r, purple.600, purple.700)'
                        }}
                      >
                        Réserver
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={10} bg="gray.900" borderTop="1px solid" borderColor="whiteAlpha.200">
        <Container maxW="7xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            spacing={4}
          >
            <HStack spacing={2}>
              <Icon as={GamepadIcon} w={6} h={6} color="purple.400" />
              <Text color="gray.400">© 2024 GameZone. Tous droits réservés.</Text>
            </HStack>
            <HStack spacing={6}>
              <Text color="gray.400" cursor="pointer" _hover={{ color: 'purple.400' }}>
                Contact
              </Text>
              <Text color="gray.400" cursor="pointer" _hover={{ color: 'purple.400' }}>
                À propos
              </Text>
              <Text color="gray.400" cursor="pointer" _hover={{ color: 'purple.400' }}>
                CGU
              </Text>
            </HStack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
